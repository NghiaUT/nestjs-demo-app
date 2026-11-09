import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class OwnershipGuard implements CanActivate {
  logger = new Logger(OwnershipGuard.name);
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    this.logger.log('===TRIGGER ROUTE GUARD===');
    // IMPLEMENT QUERY FLASH-CARD DATA AND CHECK OWNERSHIP
    return true;
  }
}
