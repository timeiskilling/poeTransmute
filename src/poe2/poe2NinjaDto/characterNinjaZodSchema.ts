import { z } from 'zod';

const PropertySchema = z.looseObject({
  name: z.string(),
  values: z.array(z.tuple([z.string(), z.number()])),
  displayMode: z.number(),
  type: z.number().optional(),
  suffix: z.string().optional(),
  icon: z.string().optional(),
});

const RequirementSchema = z.looseObject({
  name: z.string(),
  values: z.array(z.tuple([z.string(), z.number()])),
  displayMode: z.number(),
  type: z.number().optional(),
  suffix: z.string().optional(),
});

const SocketSchema = z.looseObject({
  group: z.number(),
  type: z.string(),
});

const GemPageSchema = z.looseObject({
  skillName: z.string(),
  stats: z.array(z.string()).optional(),
  properties: z.array(PropertySchema).optional(),
  description: z.string().optional(),
});

const GemTabSchema = z.looseObject({
  name: z.string().optional(),
  pages: z.array(GemPageSchema),
});

const ModSchema = z.looseObject({
  id: z.string(),
  stats: z.record(z.string(), z.number()),
});

const StructuredModsSchema = z.looseObject({
  implicit: z.array(ModSchema).optional(),
  explicit: z.array(ModSchema).optional(),
  fractured: z.array(ModSchema).optional(),
  crafted: z.array(ModSchema).optional(),
  enchant: z.array(ModSchema).optional(),
  desecrated: z.array(ModSchema).optional(),
});

const GrantedSkillSchema = z.looseObject({
  name: z.string(),
  values: z.array(z.tuple([z.string(), z.number()])),
  displayMode: z.number(),
  icon: z.string().optional(),
});

const SupportGemSchema = z.looseObject({
  socket: z.number(),
  name: z.string(),
  typeLine: z.string(),
  support: z.boolean(),
  properties: z.array(PropertySchema),
  requirements: z.array(RequirementSchema),
});

const SocketedItemSchema = z.looseObject({
  socket: z.number(),
  name: z.string(),
  typeLine: z.string(),
  baseType: z.string(),
  support: z.boolean(),
  properties: z.array(PropertySchema),
  requirements: z.array(RequirementSchema),
  gemTabs: z.array(GemTabSchema).optional(),
  level: z.number().optional(),
  qualityProperty: z.number().optional(),
});

const GemItemSchema = z.looseObject({
  name: z.string(),
  typeLine: z.string(),
  support: z.boolean(),
  gemTabs: z.array(GemTabSchema).optional(),
  gemSkill: z.string().optional(),
  properties: z.array(PropertySchema),
  requirements: z.array(RequirementSchema),
  sockets: z.array(SocketSchema),
  socketedItems: z.array(SupportGemSchema),
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
  allGems: z.array(GemSchema),
  dps: z.array(SkillDpsSchema),
});

const ItemSchema = z.looseObject({
  id: z.string().optional(),
  inventoryId: z.string().optional(),
  name: z.string(),
  typeLine: z.string(),
  baseType: z.string(),
  frameTypeId: z.string(),
  frameType: z.number(),
  ilvl: z.number(),
  icon: z.string(),
  w: z.number(),
  h: z.number(),
  x: z.number().optional(),
  y: z.number().optional(),
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
  rarity: z.string().optional(),
  stackSize: z.number().optional(),
  maxStackSize: z.number().optional(),
  qualityProperty: z.number().optional(),
  iconTierText: z.string().optional(),
  socketedIcon: z.string().optional(),
  descrText: z.string().optional(),
  secDescrText: z.string().optional(),
  flavourText: z.array(z.string()).optional(),
  sockets: z.array(SocketSchema),
  socketedItems: z.array(SocketedItemSchema),
  grantedSkills: z.array(GrantedSkillSchema),
  properties: z.array(PropertySchema),
  additionalProperties: z.array(PropertySchema),
  requirements: z.array(RequirementSchema),
  implicitMods: z.array(z.string()),
  explicitMods: z.array(z.string()),
  fracturedMods: z.array(z.string()),
  craftedMods: z.array(z.string()),
  enchantMods: z.array(z.string()),
  runeMods: z.array(z.string()),
  bondedMods: z.array(z.string()),
  desecratedMods: z.array(z.string()),
  mutatedMods: z.array(z.string()),
  utilityMods: z.array(z.string()),
  mods: StructuredModsSchema.optional(),
  gemTabs: z.array(GemTabSchema).optional(),
  gemSkill: z.string().optional(),
  gemSockets: z.array(z.string()).optional(),
  weaponRequirements: z.array(RequirementSchema).optional(),
  supportGemRequirements: z.array(RequirementSchema).optional(),
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
  physical: DamageReductionSchema.optional(),
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
  pathOfBuildingExport: z.string().optional(),
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
