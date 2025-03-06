// src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly isProduction = process.env.NODE_ENV === 'production';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, originalUrl } = request;

    // Generate request ID for tracking
    const requestId = uuidv4();
    request.requestId = requestId;

    // Get request details
    const requestData = {
      timestamp: new Date().toISOString(),
      requestId,
      method,
      url: originalUrl,
      ip: request.ip,
      userAgent: request.get('user-agent') || 'unknown',
      body: this.sanitizeData(request.body),
      query: request.query,
      params: request.params,
      headers: this.sanitizeHeaders(request.headers),
    };

    // Log request
    this.logger.log({
      type: 'Request',
      ...requestData,
    });

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseData = {
            timestamp: new Date().toISOString(),
            requestId,
            statusCode: response.statusCode,
            duration: `${Date.now() - startTime}ms`,
            // response: this.sanitizeData(data),
            response: data,
          };

          this.logger.log({
            type: 'Response',
            ...requestData,
            ...responseData,
          });

          // Add response time header
          response.header('X-Response-Time', `${Date.now() - startTime}ms`);
        },
        error: (error) => {
          const errorData = {
            timestamp: new Date().toISOString(),
            requestId,
            statusCode: error.status || 500,
            duration: `${Date.now() - startTime}ms`,
            error: {
              name: error.name,
              message: error.message,
              stack: this.isProduction ? undefined : error.stack,
            },
          };

          this.logger.error({
            type: 'Error',
            ...requestData,
            ...errorData,
          });
        },
      }),
    );
  }

  private sanitizeData(data: any): any {
    if (!data) return null;

    const sensitiveFields = [
      'password',
      'token',
      'authorization',
      'credit_card',
      'secret',
      'api_key',
    ];

    const sanitized = { ...data };

    const sanitizeObject = (obj: any) => {
      Object.keys(obj).forEach((key) => {
        const lowerKey = key.toLowerCase();
        if (sensitiveFields.some((field) => lowerKey.includes(field))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      });
    };

    sanitizeObject(sanitized);
    return sanitized;
  }

  private sanitizeHeaders(headers: any): any {
    const sanitizedHeaders = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    sensitiveHeaders.forEach((header) => {
      if (sanitizedHeaders[header]) {
        sanitizedHeaders[header] = '[REDACTED]';
      }
    });

    return sanitizedHeaders;
  }
}

// src/common/types/request.interface.ts
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

// src/common/interceptors/index.ts
export * from './logging.interceptor';
