import { z } from 'zod';

const PropertySchema = z.looseObject({
  name: z.string(),
  values: z.array(z.tuple([z.string(), z.number()])),
  displayMode: z.number(),
  type: z.number().nullish(),
  suffix: z.string().nullish(),
  icon: z.string().nullish(),
});

const RequirementSchema = z.looseObject({
  name: z.string(),
  values: z.array(z.tuple([z.string(), z.number()])),
  displayMode: z.number(),
  type: z.number().nullish(),
  suffix: z.string().nullish(),
});

const SocketSchema = z.looseObject({
  group: z.number(),
  type: z.string(),
});

const GemPageSchema = z.looseObject({
  skillName: z.string(),
  stats: z.array(z.string()).nullish(),
  properties: z.array(PropertySchema).nullish(),
  description: z.string().nullish(),
});

const GemTabSchema = z.looseObject({
  name: z.string().nullish(),
  pages: z.array(GemPageSchema),
});

const ModSchema = z.looseObject({
  id: z.string(),
  stats: z.record(z.string(), z.number()),
});

const StructuredModsSchema = z.looseObject({
  implicit: z.array(ModSchema).nullish(),
  explicit: z.array(ModSchema).nullish(),
  fractured: z.array(ModSchema).nullish(),
  crafted: z.array(ModSchema).nullish(),
  enchant: z.array(ModSchema).nullish(),
  desecrated: z.array(ModSchema).nullish(),
});

const GrantedSkillSchema = z.looseObject({
  name: z.string(),
  values: z.array(z.tuple([z.string(), z.number()])),
  displayMode: z.number(),
  icon: z.string().nullish(),
});

const SupportGemSchema = z.looseObject({
  socket: z.number(),
  name: z.string(),
  typeLine: z.string(),
  support: z.boolean(),
  properties: z.array(PropertySchema).nullish(),
  requirements: z.array(RequirementSchema).nullish(),
});

const SocketedItemSchema = z.looseObject({
  socket: z.number(),
  name: z.string(),
  typeLine: z.string(),
  baseType: z.string(),
  support: z.boolean(),
  properties: z.array(PropertySchema).nullish(),
  requirements: z.array(RequirementSchema).nullish(),
  gemTabs: z.array(GemTabSchema).nullish(),
  level: z.number().nullish(),
  qualityProperty: z.number().nullish(),
});

const GemItemSchema = z.looseObject({
  name: z.string(),
  typeLine: z.string(),
  support: z.boolean(),
  gemTabs: z.array(GemTabSchema).nullish(),
  gemSkill: z.string().nullish(),
  properties: z.array(PropertySchema).nullish(),
  requirements: z.array(RequirementSchema).nullish(),
  sockets: z.array(SocketSchema).nullish(),
  socketedItems: z.array(SupportGemSchema).nullish(),
});

const GemSchema = z.looseObject({
  name: z.string(),
  level: z.number(),
  quality: z.number(),
  itemData: GemItemSchema,
});

const SkillDpsSchema = z.looseObject({
  name: z.string(),
  dps: z.number(),
  dotDps: z.number(),
  damageTypes: z.array(z.number()),
  dotDamageTypes: z.array(z.number()),
  damage: z.array(z.number()),
});

const SkillSchema = z.looseObject({
  allGems: z.array(GemSchema).nullish(),
  dps: z.array(SkillDpsSchema).nullish(),
});

const ItemSchema = z.looseObject({
  id: z.string().nullish(),
  inventoryId: z.string().nullish(),
  name: z.string(),
  typeLine: z.string(),
  baseType: z.string(),
  frameTypeId: z.string(),
  frameType: z.number(),
  ilvl: z.number(),
  icon: z.string(),
  w: z.number(),
  h: z.number(),
  x: z.number().nullish(),
  y: z.number().nullish(),
  league: z.string(),
  realm: z.string(),
  identified: z.boolean(),
  corrupted: z.boolean(),
  fractured: z.boolean(),
  synthesised: z.boolean(),
  duplicated: z.boolean(),
  mutated: z.boolean(),
  support: z.boolean(),
  replica: z.boolean(),
  verified: z.boolean(),
  rarity: z.string().nullish(),
  stackSize: z.number().nullish(),
  maxStackSize: z.number().nullish(),
  qualityProperty: z.number().nullish(),
  iconTierText: z.string().nullish(),
  socketedIcon: z.string().nullish(),
  descrText: z.string().nullish(),
  secDescrText: z.string().nullish(),
  flavourText: z.array(z.string()).nullish(),
  sockets: z.array(SocketSchema).nullish(),
  socketedItems: z.array(SocketedItemSchema).nullish(),
  grantedSkills: z.array(GrantedSkillSchema).nullish(),
  properties: z.array(PropertySchema).nullish(),
  additionalProperties: z.array(PropertySchema).nullish(),
  requirements: z.array(RequirementSchema).nullish(),
  implicitMods: z.array(z.string()).nullish(),
  explicitMods: z.array(z.string()).nullish(),
  fracturedMods: z.array(z.string()).nullish(),
  craftedMods: z.array(z.string()).nullish(),
  enchantMods: z.array(z.string()).nullish(),
  runeMods: z.array(z.string()).nullish(),
  bondedMods: z.array(z.string()).nullish(),
  desecratedMods: z.array(z.string()).nullish(),
  mutatedMods: z.array(z.string()).nullish(),
  utilityMods: z.array(z.string()).nullish(),
  mods: StructuredModsSchema.nullish(),
  gemTabs: z.array(GemTabSchema).nullish(),
  gemSkill: z.string().nullish(),
  gemSockets: z.array(z.string()).nullish(),
  weaponRequirements: z.array(RequirementSchema).nullish(),
  supportGemRequirements: z.array(RequirementSchema).nullish(),
});

const EquipmentSchema = z.looseObject({
  itemSlot: z.number(),
  itemData: ItemSchema,
});

const BreakdownStatSchema = z.looseObject({
  base: z.number(),
  inc: z.number(),
  more: z.number(),
  total: z.number(),
  mods: z.array(z.unknown()),
  basePercent: z.boolean(),
});

const BreakdownsSchema = z.looseObject({
  stats: z.record(z.string(), BreakdownStatSchema),
  sources: z.array(z.array(z.unknown())),
});

const DamageReductionSchema = z.looseObject({
  value: z.number(),
  max: z.number(),
  effectiveAppliedArmour: z.number(),
  base: z.number(),
  takenDamage: z.number(),
});

const DamageReductionsSchema = z.looseObject({
  physical: DamageReductionSchema.nullish(),
});

const PhysicalTakenAsSchema = z.looseObject({
  physical: z.number(),
  fire: z.number(),
  cold: z.number(),
  lightning: z.number(),
  chaos: z.number(),
});

const DefensiveStatsSchema = z.looseObject({
  life: z.number(),
  mana: z.number(),
  spirit: z.number(),
  energyShield: z.number(),
  ward: z.number(),
  strength: z.number(),
  dexterity: z.number(),
  intelligence: z.number(),
  armour: z.number(),
  evasionRating: z.number(),
  evadeChance: z.number(),
  evadeChanceMax: z.number(),
  deflectionRating: z.number(),
  deflectChance: z.number(),
  deflectChanceMax: z.number(),
  deflectEffect: z.number(),
  blockChance: z.number(),
  movementSpeed: z.number(),
  lifeRegen: z.number(),
  enduranceCharges: z.number(),
  frenzyCharges: z.number(),
  powerCharges: z.number(),
  itemRarity: z.number(),
  effectiveHealthPool: z.number(),
  physicalMaximumHitTaken: z.number(),
  fireMaximumHitTaken: z.number(),
  coldMaximumHitTaken: z.number(),
  lightningMaximumHitTaken: z.number(),
  chaosMaximumHitTaken: z.number(),
  lowestMaximumHitTaken: z.number(),
  fireResistance: z.number(),
  fireResistanceOverCap: z.number(),
  fireResistanceMax: z.number(),
  coldResistance: z.number(),
  coldResistanceOverCap: z.number(),
  coldResistanceMax: z.number(),
  lightningResistance: z.number(),
  lightningResistanceOverCap: z.number(),
  lightningResistanceMax: z.number(),
  chaosResistance: z.number(),
  chaosResistanceOverCap: z.number(),
  chaosResistanceMax: z.number(),
  damageReductions: DamageReductionsSchema,
  physicalTakenAs: PhysicalTakenAsSchema,
});

const KeystoneSchema = z.looseObject({
  name: z.string(),
  icon: z.string(),
  stats: z.array(z.string()),
});

const PassiveCountsSchema = z.looseObject({
  passives: z.number(),
  anoints: z.number(),
  ascendancy: z.number(),
  bonusPassives: z.number(),
});

export const PoeNinjaApiResponseSchema = z.looseObject({
  account: z.string(),
  name: z.string(),
  league: z.string(),
  level: z.number(),
  class: z.string(),
  baseClass: z.number(),
  pathOfBuildingExport: z.string().nullish(),
  defensiveStats: DefensiveStatsSchema,
  breakdowns: BreakdownsSchema,
  skills: z.array(SkillSchema),
  items: z.array(EquipmentSchema),
  flasks: z.array(EquipmentSchema),
  jewels: z.array(EquipmentSchema),
  keystones: z.array(KeystoneSchema),
  passiveSelection: z.array(z.number()),
  passiveSelectionSet1: z.array(z.number()),
  passiveSelectionSet2: z.array(z.number()),
  passiveCounts: PassiveCountsSchema,
  passiveTreeName: z.string(),
  updatedUtc: z.string(),
  lastCheckedUtc: z.string(),
  status: z.number(),
  useSecondWeaponSet: z.boolean(),
  enableBondedMods: z.boolean(),
  questStats: z.array(z.string()),
});

export type PoeNinjaCharacterApiResponse = z.infer<
  typeof PoeNinjaApiResponseSchema
>;
