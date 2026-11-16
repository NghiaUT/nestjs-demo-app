import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  port(): number {
    return this.config.get<number>('PORT', 3000);
  }

  isProduction(): boolean {
    return this.config.get<string>('NODE_ENV') === 'production';
  }

  database() {
    return {
      host: this.config.getOrThrow<string>('DB_HOST'),
      port: this.config.getOrThrow<number>('DB_PORT'),
      user: this.config.getOrThrow<string>('DB_USER'),
      password: this.config.getOrThrow<string>('DB_PASS'),
      name: this.config.getOrThrow<string>('DB_NAME'),
    };
  }

  jwt() {
    return {
      access: {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.getOrThrow<number>('JWT_ACCESS_EXPIRES_IN'),
      },
      refresh: {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.getOrThrow<number>('JWT_REFRESH_EXPIRES_IN'),
      },
    };
  }

  redis() {
    return {
      url: this.config.getOrThrow<string>('REDIS_URL'),
    };
  }

  mongo() {
    return {
      uri: this.config.getOrThrow<string>('MONGODB_URI'),
    };
  }
}
