// strategies/jwt-refresh.strategy.ts  (xác thực refresh token)
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AppConfigService } from '../../config/config.service.js';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly appConfigService: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: appConfigService.jwt().refresh.secret,
      passReqToCallback: true,
    });
  }
  validate(req: Request, payload: { sub: number; email: string }) {
    return {
      userId: payload.sub,
      email: payload.email,
      refreshToken: req.body.refreshToken,
    };
  }
}
