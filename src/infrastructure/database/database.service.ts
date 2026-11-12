import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AppConfigService } from '../../config/config.service.js';

export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly appConfigService: AppConfigService) {}
  private readonly logger = new Logger(DatabaseService.name);
  private connection: any;

  async createDBConnection(url: string): Promise<string> {
    this.logger.log('[Database] Try to connect to ' + url);
    await timeout(3000);
    return url;
  }

  async close() {
    this.logger.log(`[Database] close connection on ${this.connection}`);
  }

  getConnection() {
    return this.connection;
  }

  async onModuleDestroy() {
    await this.connection?.close?.();
  }
  async onModuleInit() {
    const databaseUri = this.appConfigService.mongo().uri;
    if (!databaseUri)
      throw new ServiceUnavailableException('Có lỗi khi kết nối DB');
    this.connection = await this.createDBConnection(databaseUri);
    this.logger.log(
      '[Database] Database connected successfully to ' + databaseUri,
    );
  }
}
