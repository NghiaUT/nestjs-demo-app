import { Global, Module } from '@nestjs/common';
import { AppConfigModule } from '../../config/config.module.js';
import { CacheService } from './cache.service.js';

@Global()
@Module({
  imports: [AppConfigModule],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
