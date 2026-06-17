import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { RootConfig } from '../config/configuration.types';

export const DRIZZLE = Symbol('DRIZZLE_CONNECTION');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<RootConfig>) => {
        const dbConfig = configService.get('database', { infer: true });

        if (!dbConfig) {
          throw new Error('Database configuration is missing');
        }

        const queryClient = postgres({
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.user,
          password: dbConfig.password,
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
  exports: [],
})
export class DatabaseModule {}
