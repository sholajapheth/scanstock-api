import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        let exception: HttpException;
        const ctx = context.getClass().name;

        // Extract useful error information
        const errorInfo = {
          context: ctx,
          path: context.switchToHttp().getRequest().url,
          method: context.switchToHttp().getRequest().method,
          statusCode: error instanceof HttpException ? error.getStatus() : 500,
          message: error.message,
          stack: this.isProduction ? undefined : error.stack,
        };

        this.logger.error('API Error', errorInfo);

        if (error instanceof HttpException) {
          exception = error;
        } else if (
          error.name === 'JsonWebTokenError' ||
          error.message.includes('JWT')
        ) {
          exception = new UnauthorizedException('Authentication failed');
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
