import type { HeroClassName } from "./dnd-domain";
import {
  fetchHeroClasses,
  fetchHeroClassSpells,
  fetchSpell,
  fetchSpellIcon,
} from "./services/dnd-api.js";

const spellCache = new Map();

async function getSpellWithIcon(spellId: string) {
  if (spellCache.has(spellId)) {
    return spellCache.get(spellId);
  }

  try {
    const spell = await fetchSpell(spellId);
    if (!spell) return null;

    let spellIcon = null;
    try {
      spellIcon = await fetchSpellIcon(spellId);
    } catch (error) {
      console.warn(`Failed to fetch icon for spell ${spellId}:`, error);
    }

    const spellWithIcon = {
      ...spell,
      icon: spellIcon || spell.icon,
    };

    spellCache.set(spellId, spellWithIcon);
    return spellWithIcon;
  } catch (error) {
    console.warn(`Failed to fetch spell ${spellId}:`, error);
    return null;
  }
}

async function getClassWithSpells(name: string, icon: string) {
  const spellIds = await fetchHeroClassSpells(name as HeroClassName);
  const spellPromises = spellIds.map(getSpellWithIcon);
  const spells = await Promise.all(spellPromises);

  return {
    name,
    icon,
    spells: spells.filter((spell) => spell !== null),
  };
}

export const root = {
  classes: async () => {
    const classesWithIcons = await fetchHeroClasses();
    const classPromises = Object.entries(classesWithIcons).map(
      async ([name, icon]) => getClassWithSpells(name, icon)
    );
    return await Promise.all(classPromises);
  },

  class: async ({ name }: { name: HeroClassName }) => {
    const classesWithIcons = await fetchHeroClasses();
    const icon = classesWithIcons[name];

    if (!icon) return null;

    return await getClassWithSpells(name, icon);
  },

  classSpells: async ({ className }: { className: HeroClassName }) => {
    const spellIds = await fetchHeroClassSpells(className);
    const spellPromises = spellIds.map(getSpellWithIcon);
    const spells = await Promise.all(spellPromises);
    return spells.filter((spell) => spell !== null);
  },

  spell: async ({ id }: { id: string }) => {
    return await getSpellWithIcon(id);
  },

  spellsByLevel: async ({ level }: { level: number }) => {
    const classesWithIcons = await fetchHeroClasses();
    const allSpellIds = new Set<string>();

    for (const className of Object.keys(classesWithIcons)) {
      const spellIds = await fetchHeroClassSpells(className as HeroClassName);
      spellIds.forEach((id) => allSpellIds.add(id));
    }

    const spellPromises = Array.from(allSpellIds).map(getSpellWithIcon);
    const allSpells = await Promise.all(spellPromises);

    return allSpells.filter((spell) => spell !== null && spell.level === level);
  },

  spells: async ({
    level,
    className,
    limit,
  }: {
    level?: number;
    className?: HeroClassName;
    limit?: number;
  }) => {
    let spellIds: string[];

    if (className) {
      spellIds = await fetchHeroClassSpells(className);
    } else {
      const classesWithIcons = await fetchHeroClasses();
      const allSpellIds = new Set<string>();

      for (const name of Object.keys(classesWithIcons)) {
        const classSpellIds = await fetchHeroClassSpells(name as HeroClassName);
        classSpellIds.forEach((id) => allSpellIds.add(id));
      }

      spellIds = Array.from(allSpellIds);
    }

    const spellPromises = spellIds.map(getSpellWithIcon);
    const spells = await Promise.all(spellPromises);

    let filteredSpells = spells.filter((spell) => spell !== null);

    if (level !== undefined) {
      filteredSpells = filteredSpells.filter((spell) => spell.level === level);
    }

    if (limit !== undefined && limit > 0) {
      filteredSpells = filteredSpells.slice(0, limit);
    }

    return filteredSpells;
  },
};
