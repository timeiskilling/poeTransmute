import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { DrizzleService } from './drizzleService';
import * as schema from '../schema';
import { ConfigService } from '@nestjs/config';
import { RootConfig } from 'src/poe2/config/configuration.types';
import { Poe2NinjaResponse } from 'src/poe2/poe2NinjaDto/currency';
import { ItemType, Poe2NinjaItemInsert } from '../schema';
import { runPromisesExecution } from 'src/promiseManager/promiseExecution';
import { RetryOptions, withRetry } from 'src/promiseManager/retry.helper';
import { createItemParser } from 'src/poe2/poe2NinjaDto/zodParser';

@Injectable()
export class InitializeService implements OnModuleInit {
  private readonly logger = new Logger(InitializeService.name);

  private readonly retryConfig: RetryOptions = {
    maxRetries: 3,
    initialDelayMs: 1000,
    backoffFactor: 2,
    retryableStatuses: [429, 500, 502, 503, 504],
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly drizzleService: DrizzleService,
    private readonly configService: ConfigService<RootConfig>,
  ) {}

  async onModuleInit() {
    this.logger.log('The database state checks ...');

    const existingsTypes = await this.drizzleService.getExistingItemTypes();
    const poeConfig = this.configService.getOrThrow('poe2', { infer: true });

    const promises: Promise<any>[] = [];

    const missingCurrencyTypes = schema.CURRENCY_TYPES.filter(
      (type) => !existingsTypes.includes(type),
    );

    missingCurrencyTypes.forEach((type) => {
      promises.push(
        this.fetchAndInitDataForType(type, poeConfig.ninjaExchangeBase),
      );
    });

    const missingStashTypes = schema.STASH_TYPES.filter(
      (type) => !existingsTypes.includes(type),
    );

    missingStashTypes.forEach((type) => {
      promises.push(
        this.fetchAndInitDataForType(type, poeConfig.ninjaStashBase),
      );
    });

    const totalMissingCount =
      missingCurrencyTypes.length + missingStashTypes.length;

    if (totalMissingCount === 0) {
      this.logger.log(
        'The data already exists in the database. Skipping initialization.',
      );
      return;
    }

    this.logger.log(
      `Fetching missing types. Currency: ${missingCurrencyTypes.length}, Stash: ${missingStashTypes.length}`,
    );

    const results = await runPromisesExecution(promises)
      .catchError('Err at intitialisating the part of data')
      .executeAllSettled();

    this.logger.log(`Success: ${results.length} types of data processed`);
  }

  private async fetchAndInitDataForType(
    type: string,
    itemsBase: string,
  ): Promise<any> {
    this.logger.log(`Loading data for type: ${type}...`);

    const poeConfig = this.configService.getOrThrow('poe2', { infer: true });
    const url = `${poeConfig.ninjaApiRootUrl}${itemsBase}?league=${encodeURIComponent(poeConfig.league)}&type=${type}`;

    const randomDelay = Math.random() * 1000;
    const response = await withRetry(
      () => this.httpService.axiosRef.get<Poe2NinjaResponse>(url),
      {
        ...this.retryConfig,
        initialDelayMs: this.retryConfig.initialDelayMs + randomDelay,
      },
      this.logger,
      `Fetch ${type}`,
    );

    const rawItems = response.data.items;

    if (!rawItems || rawItems.length === 0) {
      this.logger.warn(`API returned empty items array for type: ${type}`);
      return { type, status: 'skipped', reason: 'empty_data' };
    }

    const parser = createItemParser(type as ItemType, poeConfig.imageBaseUrl);

    const formatedTypes: Poe2NinjaItemInsert[] = rawItems.map((raw) =>
      parser.parse(raw),
    );

    await this.drizzleService.insertItems(formatedTypes);

    return { type, status: 'success', count: formatedTypes.length };
  }
}
