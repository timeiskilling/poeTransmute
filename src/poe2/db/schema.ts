import { pgTable, timestamp, varchar, uuid, text } from 'drizzle-orm/pg-core';

export const currency = pgTable('currency', {
  id: uuid('id'),
  name: varchar('name', { length: 255 }),
  image: text('image'),
  category: varchar('category', { length: 255 }),
  detailsId: varchar('detailsId', { length: 255 }).primaryKey(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export type Currency = typeof currency.$inferInsert;
export type CurrencySelect = typeof currency.$inferSelect;
