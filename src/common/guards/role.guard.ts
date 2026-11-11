import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Role } from '../decorators/role.decorator.js';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.get(Role, context.getHandler());
    console.log(requiredRoles);
    const request = context.switchToHttp().getRequest<Request>();
    const role = request.headers['role'];
    if (!role || Array.isArray(role))
      throw new BadRequestException('Không có role hoặc role đang là mảng');
    return requiredRoles.includes(role) ? true : false;
  }
}
