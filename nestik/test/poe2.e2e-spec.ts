/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PoeNinjaApiResponseSchema } from '../src/poe2/poe2NinjaDto/characterNinjaZodSchema';
import { log } from 'node:console';

describe('Poe2 Controller (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/poe2 (GET) - should return json array or object', async () => {
    const response = await request(app.getHttpServer())
      .get('/poe2/character')
      .expect(200);

    const parsedData = PoeNinjaApiResponseSchema.parse(response.body);

    log(parsedData.items[0]);

    expect(parsedData).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
