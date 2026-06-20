import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { DrizzleService } from '../db/service/drizzleService';
import { CURRENCY_TYPES, STASH_TYPES } from '../db/schema';
import { Poe2PricesService } from '../services/poe2.priceService';
import { ConfigService } from '@nestjs/config';
import { Poe2Config, RootConfig } from '../config/configuration.types';
import { runPromiseExecution } from 'src/promiseManager/promiseExecution';

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
  async getEconomy(@Param('type') type: string) {
    const isCurrency = (CURRENCY_TYPES as readonly string[]).includes(type);

    const isStash = (STASH_TYPES as readonly string[]).includes(type);

    if (isCurrency) {
      return await this.poe2PriceService.getPricesForType(
        type,
        this.poeConfig.ninjaExchangeBase,
      );
    } else if (isStash) {
      return await this.poe2PriceService.getPricesForType(
        type,
        this.poeConfig.ninjaStashBase,
      );
    } else {
      throw new BadRequestException(
        `Invalid type: ${type}. Must be one of the allowed currency or stash types.`,
      );
    }
  }

  @Get('history/:itemId')
  async getHistory(@Param('itemId') itemId: string) {
    const promise = this.drizzleService.getItemType(itemId);
    const type = await runPromiseExecution(promise)
      .catchError('Failed serch item type')
      .throwIfEmptyArray('Item not found', HttpStatus.NOT_FOUND);

    const isCurrency = (CURRENCY_TYPES as readonly string[]).includes(type);

    const isStash = (STASH_TYPES as readonly string[]).includes(type);

    if (isCurrency) {
      return await this.poe2PriceService.getPricesForItem(
        type,
        this.poeConfig.ninjaExchangeItemHistory,
      );
    } else if (isStash) {
      return await this.poe2PriceService.getPricesForItem(
        type,
        this.poeConfig.ninjaStashItemHistory,
      );
    } else {
      throw new BadRequestException(
        `Invalid type: ${type}. Must be one of the allowed currency or stash types.`,
      );
    }
  }
}
