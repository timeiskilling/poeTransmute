export interface PoeNinjaCharacterDto {
  account: string;
  name: string;
  league: string;

  level: number;
  class: string;
  baseClass: number;

  pathOfBuildingExport?: string;

  defensiveStats: PoeNinjaDefensiveStatsDto;
  breakdowns: PoeNinjaBreakdownsDto;

  skills: PoeNinjaSkillDto[];

  items: PoeNinjaEquipmentDto[];
  flasks: PoeNinjaEquipmentDto[];
  jewels: PoeNinjaEquipmentDto[];

  keystones: PoeNinjaKeystoneDto[];

  passiveSelection: number[];
  passiveSelectionSet1: number[];
  passiveSelectionSet2: number[];

  passiveCounts: PoeNinjaPassiveCountsDto;

  passiveTreeName: string;

  updatedUtc: string;
  lastCheckedUtc: string;

  status: number;

  useSecondWeaponSet: boolean;
  enableBondedMods: boolean;

  questStats: string[];
}

export interface PoeNinjaPropertyDto {
  name: string;
  values: [string, number][];
  displayMode: number;
  type?: number;
  suffix?: string;
  icon?: string;
}

export interface PoeNinjaRequirementDto {
  name: string;
  values: [string, number][];
  displayMode: number;
  type?: number;
  suffix?: string;
}

export interface PoeNinjaSocketDto {
  group: number;
  type: string;
}

export interface PoeNinjaGemPageDto {
  skillName: string;
  stats?: string[];
  properties?: PoeNinjaPropertyDto[];
  description?: string;
}

export interface PoeNinjaGemTabDto {
  name?: string;
  pages: PoeNinjaGemPageDto[];
}

export interface PoeNinjaModDto {
  id: string;
  stats: Record<string, number>;
}

export interface PoeNinjaStructuredModsDto {
  implicit?: PoeNinjaModDto[];
  explicit?: PoeNinjaModDto[];
  fractured?: PoeNinjaModDto[];
  crafted?: PoeNinjaModDto[];
  enchant?: PoeNinjaModDto[];
  desecrated?: PoeNinjaModDto[];
}

export interface PoeNinjaGrantedSkillDto {
  name: string;
  values: [string, number][];
  displayMode: number;
  icon?: string;
}

export interface PoeNinjaSocketedItemDto {
  socket: number;
  name: string;
  typeLine: string;
  baseType: string;
  support: boolean;
  properties: PoeNinjaPropertyDto[];
  requirements: PoeNinjaRequirementDto[];
  gemTabs?: PoeNinjaGemTabDto[];
  level?: number;
  qualityProperty?: number;
}

export interface PoeNinjaItemDto {
  id?: string;
  inventoryId?: string;
  name: string;
  typeLine: string;
  baseType: string;
  frameTypeId: string;
  frameType: number;
  ilvl: number;
  icon: string;
  w: number;
  h: number;
  x?: number;
  y?: number;
  league: string;
  realm: string;
  identified: boolean;
  corrupted: boolean;
  fractured: boolean;
  synthesised: boolean;
  duplicated: boolean;
  mutated: boolean;
  support: boolean;
  replica: boolean;
  verified: boolean;
  rarity?: string;
  stackSize?: number;
  maxStackSize?: number;
  qualityProperty?: number;
  iconTierText?: string;
  socketedIcon?: string;
  descrText?: string;
  secDescrText?: string;
  flavourText?: string[];
  sockets: PoeNinjaSocketDto[];
  socketedItems: PoeNinjaSocketedItemDto[];

  grantedSkills: PoeNinjaGrantedSkillDto[];
  properties: PoeNinjaPropertyDto[];
  additionalProperties: PoeNinjaPropertyDto[];
  requirements: PoeNinjaRequirementDto[];
  implicitMods: string[];
  explicitMods: string[];
  fracturedMods: string[];
  craftedMods: string[];
  enchantMods: string[];
  runeMods: string[];
  bondedMods: string[];
  desecratedMods: string[];
  mutatedMods: string[];
  utilityMods: string[];
  mods?: PoeNinjaStructuredModsDto;
  gemTabs?: PoeNinjaGemTabDto[];
  gemSkill?: string;
  gemSockets?: string[];
  weaponRequirements?: PoeNinjaRequirementDto[];
  supportGemRequirements?: PoeNinjaRequirementDto[];
}

export interface PoeNinjaEquipmentDto {
  itemSlot: number;
  itemData: PoeNinjaItemDto;
}

export interface PoeNinjaSupportGemDto {
  socket: number;
  name: string;
  typeLine: string;
  support: boolean;
  properties: PoeNinjaPropertyDto[];
  requirements: PoeNinjaRequirementDto[];
}

export interface PoeNinjaGemItemDto {
  name: string;
  typeLine: string;
  support: boolean;
  gemTabs?: PoeNinjaGemTabDto[];
  gemSkill?: string;
  properties: PoeNinjaPropertyDto[];
  requirements: PoeNinjaRequirementDto[];
  sockets: PoeNinjaSocketDto[];
  socketedItems: PoeNinjaSupportGemDto[];
}

export interface PoeNinjaGemDto {
  name: string;
  level: number;
  quality: number;
  itemData: PoeNinjaGemItemDto;
}

export interface PoeNinjaSkillDpsDto {
  name: string;
  dps: number;
  dotDps: number;
  damageTypes: number[];
  dotDamageTypes: number[];
  damage: number[];
}

export interface PoeNinjaSkillDto {
  allGems: PoeNinjaGemDto[];
  dps: PoeNinjaSkillDpsDto[];
}

export interface PoeNinjaBreakdownStatDto {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: unknown[];
  basePercent: boolean;
}

export interface PoeNinjaBreakdownsDto {
  stats: Record<string, PoeNinjaBreakdownStatDto>;
  sources: unknown[][];
}

export interface PoeNinjaDamageReductionDto {
  value: number;
  max: number;
  effectiveAppliedArmour: number;
  base: number;
  takenDamage: number;
}

export interface PoeNinjaDamageReductionsDto {
  physical?: PoeNinjaDamageReductionDto;
}

export interface PoeNinjaPhysicalTakenAsDto {
  physical: number;
  fire: number;
  cold: number;
  lightning: number;
  chaos: number;
}

export interface PoeNinjaDefensiveStatsDto {
  life: number;
  mana: number;
  spirit: number;
  energyShield: number;
  ward: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  armour: number;
  evasionRating: number;
  evadeChance: number;
  evadeChanceMax: number;
  deflectionRating: number;
  deflectChance: number;
  deflectChanceMax: number;
  deflectEffect: number;
  blockChance: number;
  movementSpeed: number;
  lifeRegen: number;
  enduranceCharges: number;
  frenzyCharges: number;
  powerCharges: number;
  itemRarity: number;
  effectiveHealthPool: number;
  physicalMaximumHitTaken: number;
  fireMaximumHitTaken: number;
  coldMaximumHitTaken: number;
  lightningMaximumHitTaken: number;
  chaosMaximumHitTaken: number;
  lowestMaximumHitTaken: number;
  fireResistance: number;
  fireResistanceOverCap: number;
  fireResistanceMax: number;
  coldResistance: number;
  coldResistanceOverCap: number;
  coldResistanceMax: number;
  lightningResistance: number;
  lightningResistanceOverCap: number;
  lightningResistanceMax: number;
  chaosResistance: number;
  chaosResistanceOverCap: number;
  chaosResistanceMax: number;
  damageReductions: PoeNinjaDamageReductionsDto;
  physicalTakenAs: PoeNinjaPhysicalTakenAsDto;
}

export interface PoeNinjaKeystoneDto {
  name: string;
  icon: string;
  stats: string[];
}

export interface PoeNinjaPassiveCountsDto {
  passives: number;
  anoints: number;
  ascendancy: number;
  bonusPassives: number;
}
