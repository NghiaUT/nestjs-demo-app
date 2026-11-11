import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { sendErrorResponse } from '../../util/err-response.util.js';

@Catch(HttpException)
export class HttpExcpetionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    // NOTICE: GLOBAL FILTER
    this.logger.debug('===[Error] TRIGGER GLOBAL FILTER===');
    sendErrorResponse(response, status, exception.message);
  }
  logger = new Logger(HttpException.name);
}
