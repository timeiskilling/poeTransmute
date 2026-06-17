import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database.module';
import * as schema from '../schema';
import { runPromiseExecution } from 'src/promiseManager/promiseExecution';
import { asc, desc, Column, InferSelectModel } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';

@Injectable()
export class DrizzleService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  get client() {
    return this.db;
  }

  async getItems<TTable extends PgTable<any>>(
    table: TTable,
    entityName: string,
    sortBy?: keyof TTable['_']['columns'],
    dir: 'asc' | 'desc' = 'asc',
  ) {
    const column = sortBy
      ? ((table as Record<string, unknown>)[sortBy as string] as Column)
      : undefined;

    let query = this.db
      .select()
      .from(table as any)
      .$dynamic();

    if (column) {
      query = query.orderBy(dir === 'desc' ? desc(column) : asc(column));
    }

    const promise = query as unknown as Promise<InferSelectModel<TTable>[]>;

    return await runPromiseExecution(promise)
      .catchError('Internal database error', HttpStatus.INTERNAL_SERVER_ERROR)
      .throwIfEmptyArray(
        `No ${entityName.toLowerCase()} found`,
        HttpStatus.NOT_FOUND,
      );
  }
}
