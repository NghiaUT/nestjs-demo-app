import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service.js';
import { AppConfigModule } from '../../config/config.module.js';

@Global()
@Module({
  imports: [AppConfigModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
