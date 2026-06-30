export type DatabaseConfig = {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  connectionPool: {
    max: number;
  };
};

export type RedisConfig = {
  host: string;
  port: number;
};

export interface Poe2Config {
  ninjaApiRootUrl: string;
  ninjaStashBase: string;
  ninjaExchangeBase: string;
  ninjaExchangeItemHistory: string;
  ninjaStashItemHistory: string;
  league: string;
  imageBaseUrl: string;
}

export type RootConfig = {
  port: number;
  database: DatabaseConfig;
  redis: RedisConfig;
  poe2: Poe2Config;
};
