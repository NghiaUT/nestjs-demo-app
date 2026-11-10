import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthorizationGuard implements CanActivate {
  logger = new Logger(JwtAuthorizationGuard.name);
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // NOTICE: CONTROLLER GUARD
    this.logger.log('===TRIGGER CONTROLLER GUARD===');
    // Check for public endpoint:
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    // IMPLEMENT JWT GUARD LOGIC HERE
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['jwt-token'];
    if (!token || token !== 'valid')
      throw new ForbiddenException('Bạn không đủ quyền hạn truy cập vào đây.');
    return true;
  }
}
