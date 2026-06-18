import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { DrizzleService } from './drizzleService';
import * as schema from '../schema';
import { ConfigService } from '@nestjs/config';
import { RootConfig } from 'src/poe2/config/configuration.types';
import {
  createItemParser,
  Poe2NinjaResponse,
} from 'src/poe2/poe2NinjaDto/currency';
import { Poe2NinjaItemInsert } from '../schema';
import { runPromisesExecution } from 'src/promiseManager/promiseExecution';

@Injectable()
export class InitializeService implements OnModuleInit {
  private readonly logger = new Logger(InitializeService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly drizzleService: DrizzleService,
    private readonly configService: ConfigService<RootConfig>,
  ) {}

  async onModuleInit() {
    this.logger.log('The database state checks ...');
    const allPossibleTypes = schema.currencyTypeEnum.enumValues;

    const existingsTypes = await this.drizzleService.getExistingItemTypes();

    const missingTypes = allPossibleTypes.filter(
      (type) => !existingsTypes.includes(type),
    );

    if (missingTypes.length === 0) {
      this.logger.log(
        'The data already exists in the database. Skipping initialization.',
      );
      return;
    }

    this.logger.log(
      `The following types are missing: ${missingTypes.join(', ')}`,
    );

    const promises = missingTypes.map((type) =>
      this.fetchAndInitDataForType(type),
    );

    const results = await runPromisesExecution(promises)
      .catchError('Err at intitialisating the part of data')
      .executeAllSettled();

    this.logger.log(`success: ${results.length} type of data`);
  }

  private async fetchAndInitDataForType(type: string): Promise<any> {
    this.logger.log(`Loading data for type: ${type}...`);

    const poeConfig = this.configService.getOrThrow('poe2', { infer: true });
    const url = `${poeConfig.ninjaApiUrl}?league=${encodeURIComponent(poeConfig.league)}&type=${type}`;

    const rawItems = (
      await this.httpService.axiosRef.get<Poe2NinjaResponse>(url)
    ).data.items;

    if (!rawItems || rawItems.length === 0) {
      this.logger.warn(`API returned empty items array for type: ${type}`);
      return { type, status: 'skipped', reason: 'empty_data' };
    }

    const parser = createItemParser(
      type as schema.CurrencyType,
      poeConfig.imageBaseUrl,
    );

    const formatedTypes: Poe2NinjaItemInsert[] = rawItems.map((raw) =>
      parser.parse(raw),
    );

    await this.drizzleService.insertItems(formatedTypes);

    return { type, status: 'success', count: formatedTypes.length };
  }
}
