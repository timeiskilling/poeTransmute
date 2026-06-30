import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Poe2AuthorizationService {
  private logger = new Logger(Poe2AuthorizationService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async initPoe2Auth() {}

  async refreshPoe2Auth() {}
}
