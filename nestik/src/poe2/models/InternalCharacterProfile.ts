export interface CharacterResistance {
  fire: number;
  cold: number;
  lightning: number;
  chaos: number;
}

export interface CharacterSkillSummary {
  name: string;
  dps: number;
}

export interface InternalCharacterProfile {
  account: string;
  characterName: string;
  league: string;
  level: number;
  className: string;

  ehp: number;
  life: number;
  mana: number;
  energyShield: number;
  resistances: CharacterResistance;
  lowestMaxHitTaken: number;

  mainSkills: CharacterSkillSummary[];
  completedQuestRewards: string[];
  pobExportString?: string;
}
