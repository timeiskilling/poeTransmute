import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Poe2Config, RootConfig } from '../config/configuration.types';
import { RetryOptions, withRetry } from 'src/promiseManager/retry.helper';
import { runPromiseExecution } from 'src/promiseManager/promiseExecution';
import {
  Poe2NinjaItemLineResponse,
  Poe2NinjaItemPairResponse,
} from '../poe2NinjaDto/responseDto';
import {
  LineItemResponseSchema,
  DetailPriceResponseSchema,
} from '../poe2NinjaDto/zodParser';
import z from 'zod';

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
      .catchError(`Err at fetching the data of ${type}`)
      .execute();
  }

  async getPricesForItem(itemId: string, itemsBase: string, itemType: string) {
    return await runPromiseExecution(
      this.fetchPricesForItem(itemId, itemsBase, itemType),
    )
      .catchError(`Err at fetching the data of ${itemId}`)
      .execute();
  }

  private async fetchPricesForType(
    type: string,
    itemsBase: string,
  ): Promise<Poe2NinjaItemLineResponse> {
    const url = `${this.poeConfig.ninjaApiRootUrl}${itemsBase}?league=${encodeURIComponent(this.poeConfig.league)}&type=${type}`;

    return this.fetchNinjaApi(
      url,
      LineItemResponseSchema,
      `Fetch type ${type}`,
      (data) => ({
        type,
        status: 'success',
        count: data.lines.length,
        items: data.lines,
      }),
      (reason) => ({
        type,
        status: 'error',
        reason,
      }),
    );
  }

  private async fetchPricesForItem(
    itemId: string,
    itemsBase: string,
    itemType: string,
  ): Promise<Poe2NinjaItemPairResponse> {
    const url = `${this.poeConfig.ninjaApiRootUrl}${itemsBase}?league=${encodeURIComponent(this.poeConfig.league)}&type=${itemType}&id=${itemId}`;

    return this.fetchNinjaApi(
      url,
      DetailPriceResponseSchema,
      `Fetch item ${itemId}`,
      (data) => ({
        itemId,
        status: 'success',
        count: data.pairs.length,
        items: data.pairs,
      }),
      (reason) => ({
        itemId,
        status: 'skipped',
        reason,
      }),
    );
  }

  private async fetchNinjaApi<
    Schema extends z.ZodTypeAny,
    SuccessType,
    ErrorType,
  >(
    url: string,
    schema: Schema,
    logContext: string,
    mapSuccess: (data: z.infer<Schema>) => SuccessType,
    mapError: (reason: string) => ErrorType,
  ): Promise<SuccessType | ErrorType> {
    const randomDelay = Math.random() * 2500;
    const result = await runPromiseExecution(
      withRetry(
        () =>
          this.httpService.axiosRef
            .get<z.infer<Schema>>(url)
            .then((res) => res.data),
        {
          ...this.retryConfig,
          initialDelayMs: this.retryConfig.initialDelayMs + randomDelay,
        },
        this.logger,
        logContext,
      ),
    )
      .catchError(`Network or Server error at ${logContext}`)
      .validate(schema, 'invalid_format')
      .executeSafeResult();

    if (result.status === 'error') {
      this.logger.error(`Failed to process ${logContext}: ${result.reason}`);
      return mapError(result.reason);
    }

    return mapSuccess(result.data);
  }
}
