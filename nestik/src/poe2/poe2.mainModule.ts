import { Module } from '@nestjs/common';
import { Poe2Controller } from './controllers/poe2.Controller';
import { Poe2PricesService } from './services/poe2.priceService';
import { HttpModule } from '@nestjs/axios';
import { Poe2Character } from './controllers/poe2.Charactes';

@Module({
  imports: [HttpModule],
  controllers: [Poe2Controller, Poe2Character],
  providers: [Poe2PricesService],
})
export class Poe2Module {}
