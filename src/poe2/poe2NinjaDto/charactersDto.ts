export interface Root {
  account: string;
  name: string;
  league: string;
  defensiveStats: DefensiveStats;
  breakdowns: Breakdowns;
  skills: Skill[];
  level: number;
  class: string;
  pathOfBuildingExport: string;
  items: Item[];
  keystones: Keystone[];
  flasks: Flask[];
  jewels: Jewel[];
  passiveSelection: number[];
  passiveSelectionSet1: any[];
  passiveSelectionSet2: any[];
  passiveCounts: PassiveCounts;
  passiveTreeName: string;
  updatedUtc: string;
  lastCheckedUtc: string;
  status: number;
  baseClass: number;
  useSecondWeaponSet: boolean;
  enableBondedMods: boolean;
  questStats: string[];
}

export interface DefensiveStats {
  life: number;
  energyShield: number;
  ward: number;
  mana: number;
  spirit: number;
  movementSpeed: number;
  lifeRegen: number;
  evasionRating: number;
  evadeChance: number;
  evadeChanceMax: number;
  enemyAccuracy: number;
  baseEvadeChance: number;
  armour: number;
  damageReductions: DamageReductions;
  deflectChance: number;
  deflectChanceMax: number;
  deflectionRating: number;
  deflectEffect: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  enduranceCharges: number;
  frenzyCharges: number;
  powerCharges: number;
  effectiveHealthPool: number;
  physicalMaximumHitTaken: number;
  fireMaximumHitTaken: number;
  coldMaximumHitTaken: number;
  lightningMaximumHitTaken: number;
  chaosMaximumHitTaken: number;
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
  blockChance: number;
  itemRarity: number;
  physicalTakenAs: PhysicalTakenAs;
  lowestMaximumHitTaken: number;
}

export interface DamageReductions {
  physical: Physical;
}

export interface Physical {
  value: number;
  max: number;
  effectiveAppliedArmour: number;
  base: number;
  takenDamage: number;
}

export interface PhysicalTakenAs {
  physical: number;
  lightning: number;
  fire: number;
  cold: number;
  chaos: number;
}

export interface Breakdowns {
  stats: Stats;
  sources: any[][];
}

export interface Stats {
  '4': N4;
  '22': N22;
  '37': N37;
  '33': N33;
  '17': N17;
  '21': N21;
  '35': N35;
  '31': N31;
  '15': N15;
  '19': N19;
  '24': N24;
  '25': N25;
  '7': N7;
  '11': N11;
  '2': N2;
  '5': N5;
  '34': N34;
  '30': N30;
  '14': N14;
  '18': N18;
  '12': N12;
  '8': N8;
  '10': N10;
  '0': N0;
  '36': N36;
  '32': N32;
  '16': N16;
  '20': N20;
  '1': N1;
  '9': N9;
  '23': N23;
  '13': N13;
  '3': N3;
  '6': N6;
  '26': N26;
}

export interface N4 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N22 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: any[];
  basePercent: boolean;
}

export interface N37 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: any[];
  basePercent: boolean;
}

export interface N33 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: any[];
  basePercent: boolean;
}

export interface N17 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N21 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N35 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: any[];
  basePercent: boolean;
}

export interface N31 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: any[];
  basePercent: boolean;
}

export interface N15 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N19 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N24 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: any[];
  basePercent: boolean;
}

export interface N25 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N7 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N11 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N2 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N5 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N34 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: any[];
  basePercent: boolean;
}

export interface N30 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: any[];
  basePercent: boolean;
}

export interface N14 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N18 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N12 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N8 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N10 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N0 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N36 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: any[];
  basePercent: boolean;
}

export interface N32 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: any[];
  basePercent: boolean;
}

export interface N16 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N20 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N1 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N9 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N23 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: any[];
  basePercent: boolean;
}

export interface N13 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N3 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N6 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface N26 {
  base: number;
  inc: number;
  more: number;
  total: number;
  mods: number[][];
  basePercent: boolean;
}

export interface Skill {
  allGems: AllGem[];
  dps: Dp[];
}

export interface AllGem {
  name: string;
  itemData: ItemData;
  level: number;
  quality: number;
}

export interface ItemData {
  doubleCorrupted: boolean;
  desecrated: boolean;
  desecratedMods: any[];
  bondedMods: any[];
  grantedSkills: any[];
  runeMods: any[];
  sockets: Socket[];
  socketedItems: SocketedItem[];
  support: boolean;
  gemTabs: GemTab2[];
  gemSkill?: string;
  gemSockets?: string[];
  name: string;
  frameTypeId: string;
  frameType: number;
  ilvl: number;
  icon: string;
  w: number;
  h: number;
  typeLine: string;
  baseType: string;
  identified: boolean;
  corrupted: boolean;
  fractured: boolean;
  synthesised: boolean;
  duplicated: boolean;
  implicitMods: any[];
  explicitMods: any[];
  mutatedMods: any[];
  mutated: boolean;
  scourgeMods: any[];
  crucibleMods: any[];
  fracturedMods: any[];
  craftedMods: any[];
  enchantMods: any[];
  utilityMods: any[];
  properties: Property4[];
  additionalProperties: any[];
  requirements: Requirement2[];
  league: string;
  descrText: string;
  secDescrText: string;
  replica: boolean;
  realm: string;
  verified: boolean;
  gemBackground?: string;
  weaponRequirements?: WeaponRequirement[];
  qualityProperty?: number;
  id?: string;
  inventoryId?: string;
  x?: number;
  y?: number;
  supportGemRequirements?: SupportGemRequirement2[];
  socketedIcon?: string;
  iconTierText?: string;
  flavourText?: string[];
}

export interface Socket {
  group: number;
  type: string;
}

export interface SocketedItem {
  socket: number;
  doubleCorrupted: boolean;
  desecrated: boolean;
  desecratedMods: any[];
  bondedMods: any[];
  grantedSkills: any[];
  runeMods: any[];
  sockets: any[];
  socketedItems: any[];
  support: boolean;
  gemTabs: GemTab[];
  supportGemRequirements?: SupportGemRequirement[];
  name: string;
  frameTypeId: string;
  frameType: number;
  ilvl: number;
  icon: string;
  w: number;
  h: number;
  typeLine: string;
  baseType: string;
  identified: boolean;
  corrupted: boolean;
  fractured: boolean;
  synthesised: boolean;
  duplicated: boolean;
  implicitMods: any[];
  explicitMods: any[];
  mutatedMods: any[];
  mutated: boolean;
  scourgeMods: any[];
  crucibleMods: any[];
  fracturedMods: any[];
  craftedMods: any[];
  enchantMods: any[];
  utilityMods: any[];
  properties: Property2[];
  additionalProperties: any[];
  requirements: Requirement[];
  league: string;
  descrText: string;
  secDescrText: string;
  replica: boolean;
  realm: string;
  verified: boolean;
  socketedIcon: string;
  iconTierText?: string;
  id?: string;
  flavourText?: string[];
}

export interface GemTab {
  name: string;
  pages: Page[];
}

export interface Page {
  skillName: string;
  stats: string[];
  properties?: Property[];
}

export interface Property {
  name: string;
  values: [string, number][];
  displayMode: number;
  type?: number;
}

export interface SupportGemRequirement {
  name: string;
  values: [string, number][];
  displayMode: number;
  type: number;
}

export interface Property2 {
  name: string;
  values: [string, number][];
  displayMode: number;
  type?: number;
}

export interface Requirement {
  name: string;
  values: [string, number][];
  displayMode: number;
  type: number;
}

export interface GemTab2 {
  name?: string;
  pages: Page2[];
}

export interface Page2 {
  skillName: string;
  stats?: string[];
  properties?: Property3[];
  description?: string;
}

export interface Property3 {
  name: string;
  values: [string, number][];
  displayMode: number;
  type?: number;
}

export interface Property4 {
  name: string;
  values: [string, number][];
  displayMode: number;
  type?: number;
}

export interface Requirement2 {
  name: string;
  values: [string, number][];
  displayMode: number;
  type: number;
  suffix?: string;
}

export interface WeaponRequirement {
  name: string;
  values: [string, number][];
  displayMode: number;
  type: number;
}

export interface SupportGemRequirement2 {
  name: string;
  values: [string, number][];
  displayMode: number;
  type: number;
}

export interface Dp {
  name: string;
  dps: number;
  dotDps: number;
  damageTypes: number[];
  dotDamageTypes: number[];
  damage: number[];
}

export interface Item {
  itemData: ItemData2;
  itemSlot: number;
}

export interface ItemData2 {
  doubleCorrupted: boolean;
  desecrated: boolean;
  desecratedMods: string[];
  bondedMods: string[];
  grantedSkills: GrantedSkill[];
  runeMods: string[];
  sockets: Socket2[];
  socketedItems: SocketedItem2[];
  support: boolean;
  mods?: Mods;
  id: string;
  inventoryId: string;
  name: string;
  frameTypeId: string;
  frameType: number;
  ilvl: number;
  icon: string;
  w: number;
  h: number;
  x: number;
  y: number;
  typeLine: string;
  baseType: string;
  identified: boolean;
  corrupted: boolean;
  fractured: boolean;
  synthesised: boolean;
  duplicated: boolean;
  implicitMods: string[];
  explicitMods: string[];
  mutatedMods: any[];
  mutated: boolean;
  scourgeMods: any[];
  crucibleMods: any[];
  fracturedMods: any[];
  craftedMods: string[];
  enchantMods: string[];
  utilityMods: any[];
  properties: Property7[];
  additionalProperties: any[];
  requirements: Requirement5[];
  league: string;
  replica: boolean;
  realm: string;
  verified: boolean;
  rarity?: string;
  qualityProperty?: number;
  flavourText?: string[];
  descrText?: string;
  stackSize?: number;
  maxStackSize?: number;
  socketedIcon?: string;
  unmodifiable?: boolean;
}

export interface GrantedSkill {
  name: string;
  values: [string, number][];
  displayMode: number;
  icon: string;
}

export interface Socket2 {
  group: number;
  type: string;
}

export interface SocketedItem2 {
  socket: number;
  doubleCorrupted: boolean;
  desecrated: boolean;
  desecratedMods: any[];
  bondedMods: string[];
  grantedSkills: any[];
  runeMods: string[];
  sockets: Socket3[];
  socketedItems: SocketedItem3[];
  support: boolean;
  id?: string;
  name: string;
  frameTypeId: string;
  frameType: number;
  ilvl: number;
  icon: string;
  w: number;
  h: number;
  typeLine: string;
  baseType: string;
  identified: boolean;
  corrupted: boolean;
  fractured: boolean;
  synthesised: boolean;
  duplicated: boolean;
  implicitMods: any[];
  explicitMods: string[];
  mutatedMods: any[];
  mutated: boolean;
  scourgeMods: any[];
  crucibleMods: any[];
  fracturedMods: any[];
  craftedMods: any[];
  enchantMods: any[];
  utilityMods: any[];
  properties: Property6[];
  additionalProperties: any[];
  requirements: Requirement4[];
  league: string;
  descrText: string;
  replica: boolean;
  stackSize?: number;
  realm: string;
  verified: boolean;
  maxStackSize?: number;
  socketedIcon?: string;
  gemTabs?: GemTab4[];
  gemSkill?: string;
  gemSockets?: string[];
  secDescrText?: string;
  flavourText?: string[];
}

export interface Socket3 {
  group: number;
  type: string;
}

export interface SocketedItem3 {
  socket: number;
  doubleCorrupted: boolean;
  desecrated: boolean;
  desecratedMods: any[];
  bondedMods: any[];
  grantedSkills: any[];
  runeMods: any[];
  sockets: any[];
  socketedItems: any[];
  support: boolean;
  gemTabs: GemTab3[];
  supportGemRequirements?: SupportGemRequirement3[];
  name: string;
  frameTypeId: string;
  frameType: number;
  ilvl: number;
  icon: string;
  w: number;
  h: number;
  typeLine: string;
  baseType: string;
  identified: boolean;
  corrupted: boolean;
  fractured: boolean;
  synthesised: boolean;
  duplicated: boolean;
  implicitMods: any[];
  explicitMods: any[];
  mutatedMods: any[];
  mutated: boolean;
  scourgeMods: any[];
  crucibleMods: any[];
  fracturedMods: any[];
  craftedMods: any[];
  enchantMods: any[];
  utilityMods: any[];
  properties: Property5[];
  additionalProperties: any[];
  requirements: Requirement3[];
  league: string;
  descrText: string;
  secDescrText: string;
  replica: boolean;
  realm: string;
  verified: boolean;
  socketedIcon: string;
  flavourText?: string[];
  iconTierText?: string;
}

export interface GemTab3 {
  name: string;
  pages: Page3[];
}

export interface Page3 {
  skillName: string;
  stats: string[];
}

export interface SupportGemRequirement3 {
  name: string;
  values: [string, number][];
  displayMode: number;
  type: number;
}

export interface Property5 {
  name: string;
  values: [string, number][];
  displayMode: number;
}

export interface Requirement3 {
  name: string;
  values: [string, number][];
  displayMode: number;
  type: number;
}

export interface Property6 {
  name: string;
  values: [string, number][];
  displayMode: number;
  type?: number;
}

export interface Requirement4 {
  name: string;
  values: [string, number][];
  displayMode: number;
  type: number;
  suffix?: string;
}

export interface GemTab4 {
  pages: Page4[];
}

export interface Page4 {
  skillName: string;
  stats?: string[];
  properties?: any[];
}

export interface Mods {
  explicit: Explicit[];
  implicit?: Implicit[];
  desecrated?: Desecrated[];
  enchant?: Enchant[];
  crafted?: Crafted[];
}

export interface Explicit {
  id: string;
  stats: Stats2;
}

export interface Stats2 {
  'base_cold_damage_resistance_%'?: number;
  'base_item_found_rarity_+%'?: number;
  base_maximum_mana?: number;
  'base_fire_damage_resistance_%'?: number;
  attack_minimum_added_lightning_damage?: number;
  attack_maximum_added_lightning_damage?: number;
  attack_minimum_added_cold_damage?: number;
  attack_maximum_added_cold_damage?: number;
  'base_deflection_rating_%_of_evasion_rating'?: number;
  'base_movement_velocity_+%'?: number;
  base_maximum_life?: number;
  local_base_evasion_rating?: number;
  local_energy_shield?: number;
  'base_lightning_damage_resistance_%'?: number;
  'local_evasion_and_energy_shield_+%'?: number;
  dummy_stat_display_nothing?: number;
  enable_ancient_order_task?: number;
  '+_deflection_rating_per_50_missing_maximum_energy_shield'?: number;
  additional_dexterity?: number;
  'companion_maximum_life_+%'?: number;
  'companion_takes_%_damage_from_deflected_hits_before_you'?: number;
  'elemental_damage_with_attack_skills_+%'?: number;
  local_minimum_added_cold_damage?: number;
  local_maximum_added_cold_damage?: number;
  'maximum_energy_shield_+%'?: number;
  'melee_skill_gem_level_+'?: number;
  additional_strength?: number;
  'spell_damage_+%'?: number;
  gain_rare_monster_mods_on_kill_ms?: number;
  'base_resist_all_elements_%'?: number;
  'all_skill_gem_quality_+'?: number;
  'explode_enemies_for_25%_life_as_chaos_on_kill_chance_%'?: number;
  'explode_enemies_for_10%_life_as_physical_on_kill_chance_%'?: number;
  'non_skill_base_all_damage_%_to_gain_as_cold_with_attacks'?: number;
  additional_base_critical_strike_chance?: number;
  'attack_speed_+%_when_on_full_life'?: number;
  'local_hit_damage_stun_multiplier_+%'?: number;
  local_accuracy_rating?: number;
}

export interface Implicit {
  id: string;
  stats: Stats3;
}

export interface Stats3 {
  'local_maximum_quality_+'?: number;
  'base_item_found_rarity_+%'?: number;
  'base_fire_damage_resistance_%'?: number;
  'stun_threshold_+%'?: number;
  local_charm_slots?: number;
  local_hand_wraps_player_level_to_use?: number;
  local_hand_wraps_evasion_rating_per_level?: number;
  local_hand_wraps_energy_shield_per_level?: number;
  local_level_requirement_override?: number;
}

export interface Desecrated {
  id: string;
  stats: Stats4;
}

export interface Stats4 {
  base_evasion_rating?: number;
  'evasion_rating_+%'?: number;
  local_minimum_added_cold_damage?: number;
  local_maximum_added_cold_damage?: number;
  'local_evasion_and_energy_shield_+%'?: number;
}

export interface Enchant {
  id: string;
  stats: Stats5;
}

export interface Stats5 {
  mod_granted_passive_hash?: number;
  'base_cold_damage_resistance_%'?: number;
}

export interface Crafted {
  id: string;
  stats: Stats6;
}

export interface Stats6 {
  'base_item_found_rarity_+%'?: number;
  'base_lightning_damage_resistance_%'?: number;
  local_critical_strike_chance?: number;
  'attack_skill_gem_level_+'?: number;
}

export interface Property7 {
  name: string;
  values: [string, number][];
  displayMode: number;
  type?: number;
}

export interface Requirement5 {
  name: string;
  values: [string, number][];
  displayMode: number;
  type: number;
}

export interface Keystone {
  name: string;
  icon: string;
  stats: string[];
}

export interface Flask {
  itemData: ItemData3;
  itemSlot: number;
}

export interface ItemData3 {
  doubleCorrupted: boolean;
  desecrated: boolean;
  desecratedMods: any[];
  bondedMods: any[];
  grantedSkills: any[];
  runeMods: any[];
  sockets: any[];
  socketedItems: any[];
  support: boolean;
  mods: Mods2;
  id: string;
  inventoryId: string;
  name: string;
  frameTypeId: string;
  frameType: number;
  ilvl: number;
  icon: string;
  w: number;
  h: number;
  x: number;
  y: number;
  typeLine: string;
  baseType: string;
  identified: boolean;
  corrupted: boolean;
  fractured: boolean;
  synthesised: boolean;
  duplicated: boolean;
  implicitMods: string[];
  explicitMods: string[];
  mutatedMods: any[];
  mutated: boolean;
  scourgeMods: any[];
  crucibleMods: any[];
  fracturedMods: any[];
  craftedMods: any[];
  enchantMods: any[];
  utilityMods: string[];
  properties: Property8[];
  additionalProperties: any[];
  requirements: Requirement6[];
  league: string;
  descrText: string;
  replica: boolean;
  realm: string;
  verified: boolean;
  rarity: string;
  flavourText?: string[];
  qualityProperty?: number;
}

export interface Mods2 {
  implicit?: Implicit2[];
  explicit: Explicit2[];
}

export interface Implicit2 {
  id: string;
  stats: Stats7;
}

export interface Stats7 {
  local_flask_use_on_killing_rare_or_unique_enemy?: number;
  local_flask_use_on_stunned?: number;
  local_flask_use_on_affected_by_slow?: number;
}

export interface Explicit2 {
  id: string;
  stats: Stats8;
}

export interface Stats8 {
  charm_gain_X_guard_for_duration?: number;
  local_flask_always_drinking?: number;
  'local_max_charges_+%'?: number;
  'local_flask_recovery_amount_%_to_recover_instantly'?: number;
  'local_flask_amount_to_recover_+%'?: number;
  local_flask_gain_X_charges_every_minute?: number;
}

export interface Property8 {
  name: string;
  values: [string, number][];
  displayMode: number;
  type?: number;
}

export interface Requirement6 {
  name: string;
  values: [string, number][];
  displayMode: number;
  type: number;
}

export interface Jewel {
  itemData: ItemData4;
  itemSlot: number;
}

export interface ItemData4 {
  doubleCorrupted: boolean;
  desecrated: boolean;
  desecratedMods: string[];
  bondedMods: any[];
  grantedSkills: any[];
  runeMods: any[];
  sockets: any[];
  socketedItems: any[];
  support: boolean;
  mods: Mods3;
  id: string;
  inventoryId: string;
  name: string;
  frameTypeId: string;
  frameType: number;
  ilvl: number;
  icon: string;
  w: number;
  h: number;
  x: number;
  y: number;
  typeLine: string;
  baseType: string;
  identified: boolean;
  corrupted: boolean;
  fractured: boolean;
  synthesised: boolean;
  duplicated: boolean;
  implicitMods: any[];
  explicitMods: string[];
  mutatedMods: any[];
  mutated: boolean;
  scourgeMods: any[];
  crucibleMods: any[];
  fracturedMods: string[];
  craftedMods: any[];
  enchantMods: any[];
  utilityMods: any[];
  properties: Property9[];
  additionalProperties: any[];
  requirements: any[];
  league: string;
  descrText: string;
  replica: boolean;
  realm: string;
  verified: boolean;
  rarity: string;
  flavourText?: string[];
}

export interface Mods3 {
  implicit?: Implicit3[];
  fractured?: Fractured[];
  explicit?: Explicit3[];
  desecrated?: Desecrated2[];
}

export interface Implicit3 {
  id: string;
  stats: Stats9;
}

export interface Stats9 {
  local_jewel_effect_base_radius: number;
}

export interface Fractured {
  id: string;
  stats: Stats10;
}

export interface Stats10 {
  'shock_duration_+%': number;
}

export interface Explicit3 {
  id: string;
  stats: Stats11;
}

export interface Stats11 {
  'cold_damage_+%'?: number;
  'freeze_threshold_+%'?: number;
  'maximum_energy_shield_+%'?: number;
  'base_curse_duration_+%'?: number;
  'base_critical_strike_multiplier_+'?: number;
}

export interface Desecrated2 {
  id: string;
  stats: Stats12;
}

export interface Stats12 {
  'global_armour_evasion_energy_shield_+%'?: number;
  'non_skill_base_all_damage_%_to_gain_as_chaos'?: number;
  'non_skill_base_all_damage_%_to_gain_as_cold'?: number;
  'base_critical_strike_multiplier_+'?: number;
  'base_spell_critical_strike_multiplier_+'?: number;
}

export interface Property9 {
  name: string;
  values: [string, number][];
  displayMode: number;
  type?: number;
}

export interface PassiveCounts {
  passives: number;
  anoints: number;
  ascendancy: number;
  bonusPassives: number;
}
