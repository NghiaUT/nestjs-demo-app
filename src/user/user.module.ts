import {
  forwardRef,
  Logger,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { AppConfigModule } from '../config/config.module.js';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema.js';
import { AppInfoModule } from '../app-info/app-info.module.js';
import { OrderModule } from '../order/order.module.js';
import { OrderService } from '../order/order.service.js';
import { Order } from '../order/entity/order.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repositories/user.repository.js';

@Module({
  controllers: [UserController],
  providers: [UserService, OrderService, UserRepository],
  exports: [UserService, MongooseModule, UserRepository],
  imports: [
    AppConfigModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AppInfoModule,
    forwardRef(() => OrderModule),
    TypeOrmModule.forFeature([Order]),
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
