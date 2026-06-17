import { pgTable, timestamp, varchar, uuid, text } from 'drizzle-orm/pg-core';

export const currency = pgTable('currency', {
  id: uuid('id').defaultRandom().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  image: text('image').notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  detailsId: varchar('detailsId', { length: 255 }).primaryKey(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export type Currency = typeof currency.$inferInsert;
export type CurrencySelect = typeof currency.$inferSelect;
