import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Check if this is a validation error
    if (
      exception.name === 'BadRequestException' &&
      exception.response &&
      exception.response.message &&
      Array.isArray(exception.response.message)
    ) {
      // Your existing validation error handling
      // ...
    } else {
      // Handle other exceptions properly
      const status =
        exception instanceof HttpException ? exception.getStatus() : 500;

      const message =
        exception.response?.message ||
        exception.message ||
        'Internal server error';

      this.logger.error({
        endpoint: `${request.method} ${request.url}`,
        statusCode: status,
        message: message,
        stack: exception.stack,
      });

      return response.status(status).json({
        statusCode: status,
        error: exception.response?.error || 'Error',
        message: message,
      });
    }
  }
}
