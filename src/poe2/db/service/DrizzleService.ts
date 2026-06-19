import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database.module';
import { items, ItemType } from '../schema';
import { eq, InferInsertModel } from 'drizzle-orm';
import { runPromiseExecution } from 'src/promiseManager/promiseExecution';
import { asc, desc, Column, InferSelectModel } from 'drizzle-orm';
import * as schema from '../schema';

@Injectable()
export class DrizzleService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  get client() {
    return this.db;
  }

  async insertItems(itemsArray: InferInsertModel<typeof items>[]) {
    const promise = this.db.insert(items).values(itemsArray);

    return await runPromiseExecution(promise)
      .catchError('Internal database error', HttpStatus.INTERNAL_SERVER_ERROR)
      .execute();
  }

  async getItems(
    itemType: ItemType,
    sortBy?: keyof typeof items._.columns,
    dir: 'asc' | 'desc' = 'asc',
  ) {
    const column = sortBy
      ? (items[sortBy as keyof typeof items] as Column)
      : undefined;

    let query = this.db
      .select()
      .from(items)
      .where(eq(items.type, itemType))
      .$dynamic();

    if (column) {
      query = query.orderBy(dir === 'desc' ? desc(column) : asc(column));
    }

    const promise = query as unknown as Promise<
      InferSelectModel<typeof items>[]
    >;

    return await runPromiseExecution(promise)
      .catchError('Internal database error', HttpStatus.INTERNAL_SERVER_ERROR)
      .throwIfEmptyArray(`No items of type found`, HttpStatus.NOT_FOUND);
  }

  async getExistingItemTypes(): Promise<string[]> {
    const result = await this.db
      .selectDistinct({ type: items.type })
      .from(items);

    return result.map((row) => row.type);
  }
}
