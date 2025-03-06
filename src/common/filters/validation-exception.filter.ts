import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
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
      // Format validation errors in a readable way
      const validationErrors = exception.response.message;

      this.logger.error({
        endpoint: `${request.method} ${request.url}`,
        statusCode: 400,
        validationErrors,
        body: request.body,
      });

      return response.status(400).json({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: validationErrors,
      });
    }

    // Pass other exceptions to the default exception handler
    throw exception;
  }
}
