import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UserModule } from './user/user.module.js';
import { VersionMiddleware } from './middlewares/version.middleware.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/guards/throttler.guard.js';
import { AuthModule } from './auth/auth.module.js';
import { PaymentModule } from './payment/payment.module.js';
import {
  createDBConnection,
  createRedisClient,
} from './utils/db-mock.connection.js';
import { AppConfigService } from './config/config.service.js';
import { AppConfigModule } from './config/config.module.js';
import { JwtAuthorizationGuard } from './common/guards/jwt-auth.guard.js';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_VER } from './common/constants/constants.js';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000,
          limit: 5,
        },
      ],
    }),
    UserModule,
    AuthModule,
    PaymentModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => ({
        uri: appConfigService.mongo().uri,

        serverSelectionTimeoutMS: 5000,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthorizationGuard,
    },
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () => {
        const connection = await createDBConnection();
        console.log(connection);
      },
    },
    {
      provide: 'REDIS_CONNECTION',
      useFactory: async (configService: AppConfigService) => {
        const client = createRedisClient(configService.redis().url);
        await client.connect(); // Mất khoảng 2 giây để kết nối thành công
        return client;
      },
      inject: [AppConfigService],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(VersionMiddleware).forRoutes('/users');
  }
}
