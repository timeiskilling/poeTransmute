import { Controller, Get } from '@nestjs/common';
import { DrizzleService } from '../db/service/drizzleService';

@Controller('exileItems')
export class Poe2Controller {
  constructor(private readonly drizzleService: DrizzleService) {}

  @Get('types')
  async getExistingTypes(): Promise<string[]> {
    return this.drizzleService.getExistingItemTypes();
  }
}
