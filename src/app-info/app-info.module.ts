import { Module } from '@nestjs/common';
import { APP_VER } from '../common/constants/constants.js';

@Module({
  providers: [
    {
      provide: APP_VER,
      useValue: { appName: 'MyApp', version: '1.0.0' },
    },
  ],
  exports: [APP_VER],
})
export class AppInfoModule {}
