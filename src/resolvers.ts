import { fetchHeroClasses, fetchHeroClassSpells, fetchSpell, fetchSpellIcon } from "./services/dnd-api.js";

import type { HeroClassName } from "./dnd-domain";

export const root = {
  classes: async () => {
    const classesWithIcons = await fetchHeroClasses();
    const classPromises = Object.entries(classesWithIcons).map(async ([name, icon]) => {
      const spells = await fetchHeroClassSpells(name as HeroClassName);
      return {
        name,
        icon,
        spells
      };
    });
    return await Promise.all(classPromises);
  },

  classSpells: async ({ className }: { className: HeroClassName }) => {
    const spellIds = await fetchHeroClassSpells(className);
    const spellPromises = spellIds.map(async (spellId) => {
      try {
        const spell = await fetchSpell(spellId);
        if (!spell) return null; // Handle case where spell doesn't exist

        // Try to fetch spell icon, but don't fail if it doesn't exist
        let spellIcon = null;
        try {
          spellIcon = await fetchSpellIcon(spellId);
        } catch (error) {
          console.warn(`Failed to fetch icon for spell ${spellId}:`, error);
        }

        return {
          ...spell,
          icon: spellIcon || spell.icon // Use API icon if our fetch failed
        };
      } catch (error) {
        console.warn(`Failed to fetch spell ${spellId}:`, error);
        return null;
      }
    });

    const spells = await Promise.all(spellPromises);
    // Filter out null spells (ones that don't exist)
    return spells.filter((spell) => spell !== null);
  },
};
