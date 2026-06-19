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
    ninjaApiRootUrl:
      process.env.POE_NINJA_ROOT_API_URL ||
      'https://poe.ninja/poe2/api/economy',
    ninjaStashBase:
      process.env.POE_NINJA_STASH_URL || '/stash/current/item/overview',
    ninjaExchangeBase:
      process.env.POE_NINJA_EXCHANGE_URL || '/exchange/current/overview',
    ninjaExchangeItemHistory:
      process.env.POE_NINJA_ITEM_HISTORY_URL || '/exchange/current/details',
    ninjaStashItemHistory:
      process.env.POE_NINJA_STASH_ITEM_HISTORY_URL ||
      '/stash/current/item/history',
    league: process.env.POE_LEAGUE || 'Runes of Aldur',
    imageBaseUrl: process.env.POE_IMAGE_BASE_URL || 'https://web.poecdn.com',
  },
});
