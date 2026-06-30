import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { RootConfig } from '../config/configuration.types';
import { DrizzleService } from './service/drizzleService';
import { DRIZZLE } from './database.constants';
import { InitializeService } from './service/initialiseService';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    DrizzleService,
    InitializeService,
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<RootConfig>) => {
        const dbConfig = configService.get('database', { infer: true });

        if (!dbConfig) {
          throw new Error('Database configuration is missing');
        }

        console.log('--- DB CONFIG CHECK ---');
        console.log('Target Database:', dbConfig.database);
        console.log('Target User:', dbConfig.user);

        if (dbConfig.database !== 'exile') {
          throw new Error(
            `CRITICAL: Tried to connect to wrong database: ${dbConfig.database}. Expected: exile`,
          );
        }

        const queryClient = postgres({
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.database,
          max: dbConfig.connectionPool.max,
        });

        try {
          await queryClient`SELECT 1`;
        } catch (error) {
          console.error('Failed to connect to the database on startup');
          throw error;
        }
        return drizzle(queryClient, { schema });
      },
    },
  ],
  exports: [DRIZZLE, DrizzleService],
})
export class DatabaseModule {}
