import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { LoggingInterceptor } from './interceptors/logging.interceptor.js';
import { HttpExcpetionFilter } from './filters/http-exception.filter.js';

async function bootstrap() {
  const logger = new Logger(bootstrap.name);
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExcpetionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.use(helmet());
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.debug('===TRIGGER GLOBAL MIDDLEWARE===');
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
