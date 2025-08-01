export type HeroClassName =
  | "wizard"
  | "cleric"
  | "fighter"
  | "rogue"
  | "paladin"
  | "ranger"
  | "sorcerer"
  | "warlock"
  | "bard"
  | "druid"
  | "monk"
  | "barbarian";

export type HeroClass = {
  name: HeroClassName;
  spells: string[];
};

export type Spell = {
  id: string;
  name: string;
  url?: string;
  icon?: string;
  level: number;
  upcast?: boolean;
  action?: string;
  duration?: string;
  range?: string;
  type?: string;
  damage?: Array<{ dice: string; damageType: string }>;
};
