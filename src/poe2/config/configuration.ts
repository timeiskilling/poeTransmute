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
  poe2: {
    ninjaApiUrl:
      process.env.POE_NINJA_API_URL ||
      'https://poe.ninja/poe2/api/economy/exchange/current/overview',
    league: process.env.POE_LEAGUE || 'Runes of Aldur',
    imageBaseUrl: process.env.POE_IMAGE_BASE_URL || 'https://web.poecdn.com',
  },
});
