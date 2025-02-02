import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal Server Error';

    // Enhanced logging
    this.logger.error(`Exception occurred: ${message}`, {
      status: httpStatus,
      timestamp: new Date().toISOString(),
      exception:
        exception instanceof Error ? exception.stack : String(exception),
    });

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      message,
      path: request.url,
    };

    response.status(httpStatus).json(responseBody);
  }
}
