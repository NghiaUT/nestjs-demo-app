import { AppConfigService } from '../config/config.service.js';

type RedisClient = {
  connect: () => Promise<void>;
};

export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createDBConnection() {
  await timeout(3000);
  return '[Database] Connection successful';
}

export function createRedisClient(redisUrl: string): RedisClient {
  return {
    connect: async () => {
      console.log(`[Redis] createRedis Connection to ${redisUrl}....`);
      await timeout(2000);
      console.log(`[Redis] Connection establised!`);

      return new Promise((resolve) => resolve());
    },
  };
}
