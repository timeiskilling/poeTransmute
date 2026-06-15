import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './client/client.module';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [ClientModule, HttpModule],
  controllers: [AppController],
  providers: [AppService, HttpService],
})
export class AppModule {}
