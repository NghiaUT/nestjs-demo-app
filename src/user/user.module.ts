import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { AppConfigModule } from '../config/config.module.js';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema.js';
import { AppInfoModule } from '../app-info/app-info.module.js';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, MongooseModule],
  imports: [
    AppConfigModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AppInfoModule,
  ],
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
