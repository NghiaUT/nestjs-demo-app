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
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.config.getOrThrow<number>('JWT_EXPIRES_IN'),
    };
  }

  mongo() {
    return {
      uri: this.config.getOrThrow<string>('MONGODB_URI'),
    };
  }
}
