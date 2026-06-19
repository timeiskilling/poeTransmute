import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();

//https://poe.ninja/poe2/api/economy/exchange/current/details?league=Runes+of+Aldur&type=Currency&id=divine-orb
//https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Runes+of+Aldur&type=Currency
