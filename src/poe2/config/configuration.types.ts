export type DatabaseConfig = {
  host: string;
  port: number;
  user: string;
  password?: string;
  connectionPool: {
    max: number;
  };
};

export type RedisConfig = {
  host: string;
  port: number;
};

export type RootConfig = {
  port: number;
  database: DatabaseConfig;
  redis: RedisConfig;
};
