export default () => ({
  port: parseInt(process.env.POE2_MANAGER_PORT || '3000', 10),
  database: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    connectionPool: {
      max: parseInt(process.env.POSTGRES_MAX_CONNECTIONS || '10', 10),
    },
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
});
