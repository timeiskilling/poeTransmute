import { Controller, Get } from '@nestjs/common';
import { Poe2Config, RootConfig } from '../config/configuration.types';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import { readCharacter } from 'src/fileReader/readCharacter';

@Controller('poe2/character')
export class Poe2Character {
  private readonly poeConfig: Poe2Config;

  constructor(private readonly configService: ConfigService<RootConfig>) {
    this.poeConfig = this.configService.getOrThrow('poe2', {
      infer: true,
    });
  }

  @Get('/')
  async getCharacterMock() {
    const filePath = path.join(
      process.cwd(),
      'characters',
      'RunesOfAldureRupture.json',
    );

    return await readCharacter(filePath);
  }
}
