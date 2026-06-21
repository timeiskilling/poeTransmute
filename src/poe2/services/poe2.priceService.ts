import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Poe2Config, RootConfig } from '../config/configuration.types';
import { RetryOptions, withRetry } from 'src/promiseManager/retry.helper';
import { DetailPriceDto } from '../poe2NinjaDto/detailPriceDto';
import { runPromiseExecution } from 'src/promiseManager/promiseExecution';
import { treeifyError } from 'zod';
import {
  Poe2NinjaItemLineResponse,
  Poe2NinjaItemPairResponse,
} from '../poe2NinjaDto/responseDto';
import {
  LineItem,
  LineItemResponseSchema,
  DetailPriceResponseSchema,
} from '../poe2NinjaDto/zodParser';

@Injectable()
export class Poe2PricesService {
  private readonly logger = new Logger(Poe2PricesService.name);
  private readonly poeConfig: Poe2Config;

  private readonly retryConfig: RetryOptions = {
    maxRetries: 3,
    initialDelayMs: 1000,
    backoffFactor: 2,
    retryableStatuses: [429, 500, 502, 503, 504],
  };
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<RootConfig>,
  ) {
    this.poeConfig = this.configService.getOrThrow('poe2', { infer: true });
  }

  async getPricesForType(type: string, itemsBase: string) {
    return await runPromiseExecution(this.fetchPricesForType(type, itemsBase))
      .catchError(`Err at fetching the date of ${type}`)
      .execute();
  }

  async getPricesForItem(itemId: string, itemsBase: string, itemType: string) {
    return await runPromiseExecution(
      this.fetchPricesForItem(itemId, itemsBase, itemType),
    )
      .catchError(`Err at fetching the date of ${itemId}`)
      .execute();
  }

  private async fetchPricesForType(
    type: string,
    itemsBase: string,
  ): Promise<Poe2NinjaItemLineResponse> {
    this.logger.log(`Loading data for type: ${type}...`);

    const poeConfig = this.poeConfig;
    const url = `${poeConfig.ninjaApiRootUrl}${itemsBase}?league=${encodeURIComponent(poeConfig.league)}&type=${type}`;
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

    const parsedData = LineItemResponseSchema.safeParse(response.data);

    if (!parsedData.success) {
      this.logger.error(`Invalid API response format for type: ${type}`);
      return { type, status: 'error', reason: 'invalid_format' };
    }

    const rawItems = parsedData.data.lines;

    if (!rawItems || rawItems.length === 0) {
      this.logger.warn(`API returned empty items array for type: ${type}`);
      return { type, status: 'error', reason: 'empty_data' };
    }

    return { type, status: 'success', count: rawItems.length, items: rawItems };
  }

  private async fetchPricesForItem(
    itemId: string,
    itemsBase: string,
    itemType: string,
  ): Promise<Poe2NinjaItemPairResponse> {
    this.logger.log(`Loading data for item: ${itemId}...`);
    const poeConfig = this.poeConfig;
    const url = `${poeConfig.ninjaApiRootUrl}${itemsBase}?league=${encodeURIComponent(poeConfig.league)}&type=${itemType}&id=${itemId}`;
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

    const parsedData = DetailPriceResponseSchema.safeParse(response.data);

    if (!parsedData.success) {
      this.logger.error(
        `Invalid API response format for type: ${itemType}`,
        treeifyError(parsedData.error),
      );
      return { itemId: itemType, status: 'error', reason: 'invalid_format' };
    }

    const rawItems = parsedData.data.pairs;

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
