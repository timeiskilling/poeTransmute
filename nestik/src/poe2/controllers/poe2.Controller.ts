import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { DrizzleService } from '../db/service/drizzleService';
import { CURRENCY_TYPES } from '../db/schema';
import { Poe2PricesService } from '../services/poe2.priceService';
import { ConfigService } from '@nestjs/config';
import { Poe2Config, RootConfig } from '../config/configuration.types';
import { runPromiseExecution } from 'src/promiseManager/promiseExecution';
import { ItemTypeValidationPipe, type ParsedItemType } from '../pipes';

@Controller('exileItems')
export class Poe2Controller {
  private readonly poeConfig: Poe2Config;
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly poe2PriceService: Poe2PricesService,
    private readonly configService: ConfigService<RootConfig>,
  ) {
    this.poeConfig = this.configService.getOrThrow('poe2', {
      infer: true,
    });
  }

  @Get('types')
  async getExistingTypes(): Promise<string[]> {
    return this.drizzleService.getExistingItemTypes();
  }

  @Get('economy/:type')
  async getEconomy(
    @Param('type', ItemTypeValidationPipe) parsedType: ParsedItemType,
  ) {
    if (parsedType.isCurrency) {
      return await this.poe2PriceService.getPricesForType(
        parsedType.value,
        this.poeConfig.ninjaExchangeBase,
      );
    }

    return await this.poe2PriceService.getPricesForType(
      parsedType.value,
      this.poeConfig.ninjaStashBase,
    );
  }

  @Get('history/:itemId')
  async getHistory(@Param('itemId') itemId: string) {
    const promise = this.drizzleService.getItemType(itemId);
    const type = await runPromiseExecution(promise)
      .catchError('Failed to search item type')
      .throwIfNullish('Item not found', HttpStatus.NOT_FOUND);

    const isCurrency = (CURRENCY_TYPES as readonly string[]).includes(type);

    return await this.poe2PriceService.getPricesForItem(
      itemId,
      isCurrency
        ? this.poeConfig.ninjaExchangeItemHistory
        : this.poeConfig.ninjaStashItemHistory,
      type,
    );
  }
}
