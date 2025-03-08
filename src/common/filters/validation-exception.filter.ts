import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Define status and message with defaults
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorName = 'UnknownError';

    // Determine appropriate status code and message
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Handle validation errors (class-validator)
      if (
        exception.name === 'BadRequestException' &&
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse &&
        Array.isArray(exceptionResponse['message'])
      ) {
        message = exceptionResponse['message'] as string[];
        errorName = 'ValidationError';
      } else if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        message = String(exceptionResponse['message']);
        errorName = exception.name;
      } else {
        message = exception.message;
        errorName = exception.name;
      }
    } else if (exception.name === 'QueryFailedError') {
      // Database errors
      status = HttpStatus.BAD_REQUEST;
      message = 'Database operation failed';
      errorName = 'DatabaseError';

      // Check for specific DB errors
      if (exception.code === '23505') {
        // Unique constraint violation
        message = 'A record with this information already exists';
      }
    } else {
      // Generic error handling
      message = exception.message || 'Internal server error';
      errorName = exception.name || 'Error';
    }

    // Log the detailed error
    this.logger.error({
      endpoint: `${request.method} ${request.url}`,
      statusCode: status,
      errorType: errorName,
      message: message,
      body: request.body,
      stack: exception.stack,
    });

    // Send response to client
    return response.status(status).json({
      statusCode: status,
      error: errorName,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
