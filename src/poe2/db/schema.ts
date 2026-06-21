import {
  pgTable,
  timestamp,
  varchar,
  uuid,
  text,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const CURRENCY_TYPES = [
  'Currency',
  'Breach',
  'Abyss',
  'Expedition',
  'Ritual',
  'Delirium',
  'Runes',
  'UncutGems',
  'Essences',
  'LineageSupportGems',
  'SoulCores',
  'Fragments',
  'Idols',
] as const;

export const STASH_TYPES = [
  'UniqueWeapons',
  'UniqueArmours',
  'UniqueAccessories',
  'UniqueFlasks',
  'UniqueCharms',
  'UniqueJewels',
  'UniqueSanctumRelics',
  'UniqueTablets',
] as const;

export const itemTypeEnum = pgEnum('item_type', [
  ...CURRENCY_TYPES,
  ...STASH_TYPES,
]);

export type ItemType = (typeof itemTypeEnum.enumValues)[number];

export const items = pgTable('items', {
  id: uuid('id').defaultRandom().notNull(),
  type: itemTypeEnum('type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  image: text('image').notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  detailsId: varchar('detailsId', { length: 255 }).primaryKey(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export type Poe2NinjaItemInsert = typeof items.$inferInsert;
export type Poe2NinjaItemSelect = typeof items.$inferSelect;
