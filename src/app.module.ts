import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import configuration from './poe2/config/configuration';
import { GlobalLoggingFilter } from './GlobalLoggingFilter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalLoggingFilter,
    },
  ],
})
export class AppModule {}
