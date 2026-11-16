import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { AppConfigService } from '../../config/config.service.js';

type SetOptions = {
  EX?: number;
};

type RedisClient = {
  connect: () => Promise<void>;
  set: (key: string, value: string, options?: SetOptions) => Promise<void>;
  get: (key: string) => string;
  del: (key: string) => void;
  quit: () => void;
};

export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: RedisClient;

  constructor(private readonly config: AppConfigService) {}

  async createRedisClient(redisUrl: string): Promise<RedisClient> {
    return {
      connect: async () => {
        console.log(`[Redis] createRedis Connection to ${redisUrl}....`);
        await timeout(100);
        console.log(`[Redis] Connection establised!`);

        return new Promise((resolve) => resolve());
      },

      set: async (key: string, value: string, options?: SetOptions) => {
        console.log(`Set ${key}-${value}`);
      },

      get: (key: string) => {
        return `Value of ${key}`;
      },

      del: (key: string) => {
        console.log(`Delete key ${key}`);
      },

      quit: () => {
        console.log('Close connection');
      },
    };
  }

  async onModuleInit() {
    this.client = await this.createRedisClient(this.config.redis().url);
    await this.client.connect();
    this.logger.log('Redis connected');
  }

  get(key: string) {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      await this.client.set(key, value, { EX: ttlSeconds });
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
