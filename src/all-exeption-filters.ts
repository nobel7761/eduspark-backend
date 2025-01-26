import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (!(exception instanceof HttpException)) {
      if (!host) {
        console.error('Host is undefined in all exception filter');
      }
      const ctx = host.switchToHttp();
      const res = ctx.getResponse<Response>();

      const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      const message = 'Internal Server Error';

      const responseBody = {
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        message,
      };

      res.status(httpStatus).json(responseBody);
    }
  }
}
