import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      // Add a timeout to prevent hanging requests
      timeout(8000), // 8 seconds timeout
      catchError((error) => {
        let exception: HttpException;
        const ctx = context.getClass().name;

        // Extract request info for logging
        const req = {
          method: request.method,
          url: request.url,
          headers: {
            ...request.headers,
            authorization: request.headers.authorization
              ? '[REDACTED]'
              : undefined,
          },
        };

        // Log the error with request details
        this.logger.error(`API Error ${req.method} ${req.url}`, {
          req,
          context: 'ErrorInterceptor',
          error: {
            message: error.message,
            name: error.name,
            status: error instanceof HttpException ? error.getStatus() : 500,
            stack: this.isProduction ? undefined : error.stack,
          },
        });

        // Handle specific error types
        if (error.name === 'TimeoutError') {
          exception = new HttpException(
            'Request timeout',
            HttpStatus.REQUEST_TIMEOUT,
          );
        } else if (error instanceof HttpException) {
          exception = error;
        } else if (
          error.name === 'JsonWebTokenError' ||
          error.message.includes('JWT')
        ) {
          exception = new UnauthorizedException('Authentication failed');
        } else if (
          error.name === 'QueryFailedError' ||
          error.code === '23505'
        ) {
          // Handle database constraint errors
          exception = new HttpException(
            'Database constraint violation',
            HttpStatus.CONFLICT,
          );
        } else {
          exception = new InternalServerErrorException(
            this.isProduction ? 'Internal server error' : error.message,
          );
        }

        return throwError(() => exception);
      }),
    );
  }
}
