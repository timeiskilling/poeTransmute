import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from '../db/service/drizzleService';
import { RootConfig } from '../config/configuration.types';
import { RetryOptions, withRetry } from 'src/promiseManager/retry.helper';
import { LineItem } from '../poe2NinjaDto/currency';
import { DetailPriceDto } from '../poe2NinjaDto/detailPriceDto';

@Injectable()
export class Poe2PricesService {
  private readonly logger = new Logger(Poe2PricesService.name);

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

  private async fetchPricesForType(
    type: string,
    itemsBase: string,
  ): Promise<any> {
    this.logger.log(`Loading data for type: ${type}...`);

    const poeConfig = this.configService.getOrThrow('poe2', { infer: true });
    const url = `${poeConfig.ninjaApiRootUrl}${itemsBase}?league=${encodeURIComponent(poeConfig.league)}&type=${type}&id=`;
    const randomDelay = Math.random() * 1000;
    const response = await withRetry(
      () => this.httpService.axiosRef.get<LineItem>(url),
      {
        ...this.retryConfig,
        initialDelayMs: this.retryConfig.initialDelayMs + randomDelay,
      },
      this.logger,
      `Fetch ${type}`,
    );

    const rawItems = response.data.lines;

    if (!rawItems || rawItems.length === 0) {
      this.logger.warn(`API returned empty items array for type: ${type}`);
      return { type, status: 'skipped', reason: 'empty_data' };
    }

    return { type, status: 'success', count: rawItems.length, items: rawItems };
  }

  private async fetchPricesForItem(
    itemId: string,
    itemsBase: string,
  ): Promise<any> {
    this.logger.log(`Loading data for item: ${itemId}...`);

    const poeConfig = this.configService.getOrThrow('poe2', { infer: true });
    const url = `${poeConfig.ninjaApiRootUrl}${itemsBase}?league=${encodeURIComponent(poeConfig.league)}&type=${itemId}&id=${itemId}`;
    const randomDelay = Math.random() * 1000;

    const response = await withRetry(
      () => this.httpService.axiosRef.get<DetailPriceDto>(url),
      {
        ...this.retryConfig,
        initialDelayMs: this.retryConfig.initialDelayMs + randomDelay,
      },
      this.logger,
      `Fetch ${itemId}`,
    );

    const rawItems = response.data.pairs;

    if (!rawItems || rawItems.length === 0) {
      this.logger.warn(`API returned empty items array for item: ${itemId}`);
      return { itemId, status: 'skipped', reason: 'empty_data' };
    }

    return {
      itemId,
      status: 'success',
      count: rawItems.length,
      items: rawItems,
    };
  }
}
