import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import mongoose from 'mongoose';
import { sendErrorResponse } from '../../util/err-response.util.js';

@Catch(mongoose.Error)
export class MongoseExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof mongoose.Error.ValidationError) {
      sendErrorResponse(response, 400, exception.message);
    }

    if (exception instanceof mongoose.Error.CastError) {
      sendErrorResponse(response, 400, exception.message);
    }

    if (
      exception instanceof mongoose.mongo.MongoServerError &&
      exception.code === 11000
    ) {
      return response.status(409).json({
        statusCode: 409,
        message: exception.message,
      });
    }

    throw exception;
  }
}
