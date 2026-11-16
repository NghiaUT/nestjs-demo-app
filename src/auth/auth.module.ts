import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserService } from '../user/user.service.js';
import { UserModule } from '../user/user.module.js';
import { SessionAuth } from './session-auth.provider.js';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshSchema,
  RefreshToken,
} from '../user/schemas/refresh-token.schema.js';
import { AppConfigModule } from '../config/config.module.js';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionAuth, JwtStrategy, JwtRefreshStrategy],
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshSchema },
    ]),
    AppConfigModule,
    PassportModule,
    JwtModule.register({}),
  ],
})
export class AuthModule {}
