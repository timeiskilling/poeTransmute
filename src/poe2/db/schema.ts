import {
  pgTable,
  timestamp,
  varchar,
  uuid,
  text,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const currencyTypeEnum = pgEnum('currency_type', [
  'Currency',
  'Breach',
  'Abyss',
  'Expedition',
  'Ritual',
  'Delirium',
  'Runes',
  'UncutGems',
  'Essences',
]);
export type CurrencyType = (typeof currencyTypeEnum.enumValues)[number];

export const items = pgTable('items', {
  id: uuid('id').defaultRandom().notNull(),
  type: currencyTypeEnum('type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  image: text('image').notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  detailsId: varchar('detailsId', { length: 255 }).primaryKey(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export type Poe2NinjaItemInsert = typeof items.$inferInsert;
export type Poe2NinjaItemSelect = typeof items.$inferSelect;
