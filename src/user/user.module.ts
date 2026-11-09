import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { AppConfigModule } from '../config/config.module.js';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [AppConfigModule],
})
export class UserModule implements OnModuleInit, OnModuleDestroy {
  logger = new Logger(UserModule.name);
  onModuleInit() {
    this.logger.log('User Module Init');
  }
  onModuleDestroy() {
    this.logger.log('User Module Destroy');
  }
}
