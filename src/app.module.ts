import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import configuration from './poe2/config/configuration';
import { GlobalLoggingFilter } from './GlobalLoggingFilter';
import { APP_FILTER } from '@nestjs/core';
import { Poe2Module } from './poe2/poe2.mainModule';
import { DatabaseModule } from './poe2/db/database.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    DatabaseModule,
    Poe2Module,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalLoggingFilter,
    },
  ],
})
export class AppModule {}
