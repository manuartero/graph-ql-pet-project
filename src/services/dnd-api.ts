import type { HeroClassName, Spell } from "../dnd-domain";

const BASE_URL = "https://inesdi2025-resources-p2.fly.dev/v1";

/**
 * https://inesdi2025-resources-p2.fly.dev/v1
 *
 * [
 * {"path":"/v1/classes","description":"List of class ids"},
 * {"path":"/v1/classes/{name}/spells","description":"List of spell ids for a class"},
 * {"path":"/v1/spells/{id}","description":"Info for one spell"},
 * {"path":"/v1/assets/classes/{asset-name}","description":"Class icon PNG"},
 * {"path":"/v1/assets/spells/{spell-id}","description":"Spell icon PNG"}
 * ]
 */
const heroClassUrl = () => `${BASE_URL}/classes`;
const heroImageUrl = (className: HeroClassName) =>
  `${BASE_URL}/assets/classes/${className}`;
const heroClassSpellsUrl = (className: HeroClassName) =>
  `${BASE_URL}/classes/${className}/spells`;
const spellUrl = (spellId: string) => `${BASE_URL}/spells/${spellId}`;
const spellIconUrl = (spellId: string) =>
  `${BASE_URL}/assets/spells/${spellId}`;

export async function fetchHeroClasses() {
  const response = await fetch(heroClassUrl());
  if (!response.ok) {
    throw new Error(`Failed to fetch hero classes: ${response.statusText}`);
  }
  const heroClasses = (await response.json()) as HeroClassName[];
  if (!Array.isArray(heroClasses)) {
    throw new Error(
      "Unexpected response format: expected an array of hero classes"
    );
  }
  if (heroClasses.length === 0) {
    return {} as Record<HeroClassName, string>;
  }

  const fetchImagePromises = heroClasses.map(fetchHeroClassImage);
  const images = await Promise.all(fetchImagePromises);

  return heroClasses.reduce((acc, className, index) => {
    acc[className] = images[index];
    return acc;
  }, {} as Record<HeroClassName, string>);
}

export async function fetchHeroClassImage(className: HeroClassName) {
  const response = await fetch(heroImageUrl(className));
  if (!response.ok) {
    throw new Error(
      `Failed to fetch image for class ${className}: ${response.statusText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:image/png;base64,${base64}`;
}

export async function fetchHeroClassSpells(className: HeroClassName) {
  const response = await fetch(heroClassSpellsUrl(className));
  if (!response.ok) {
    throw new Error(
      `Failed to fetch spells for class ${className}: ${response.statusText}`
    );
  }

  const spellIds = (await response.json()) as string[];
  if (!Array.isArray(spellIds)) {
    throw new Error(
      "Unexpected response format: expected an array of spell IDs"
    );
  }
  return spellIds;
}

export async function fetchSpell(spellId: string) {
  const response = await fetch(spellUrl(spellId));
  if (!response.ok) {
    if (response.status === 404) {
      console.warn(`Spell ${spellId} not found, skipping...`);
      return null;
    }
    throw new Error(`Failed to fetch spell ${spellId}: ${response.statusText}`);
  }

  const spell = (await response.json()) as Spell;
  if (!spell || !spell.id) {
    throw new Error("Unexpected response format for spell");
  }
  return spell;
}

export async function fetchSpellIcon(spellId: string) {
  const response = await fetch(spellIconUrl(spellId));
  if (!response.ok) {
    throw new Error(
      `Failed to fetch icon for spell ${spellId}: ${response.statusText}`
    );
  }
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:image/png;base64,${base64}`;
}
