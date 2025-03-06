import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // Sanitize the request body by removing sensitive information
    const sanitizedBody = this.sanitizeData(request.body);

    // Log the incoming request
    this.logger.log(
      `Incoming Request - ${method} ${originalUrl} - User Agent: ${userAgent} IP: ${ip}`,
      sanitizedBody ? `Request Body: ${JSON.stringify(sanitizedBody)}` : '',
    );

    // Capture the original response.end to intercept the response data
    const originalEnd = response.end;
    let responseBody: any;

    // Override response.end to capture the response body
    response.end = function (chunk: any, ...rest: any[]): any {
      if (chunk) {
        responseBody = chunk.toString();
      }
      // @ts-ignore
      return originalEnd.call(this, chunk, ...rest);
    };

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const duration = Date.now() - startTime;

      // Sanitize the response body
      const sanitizedResponse = responseBody
        ? this.sanitizeData(JSON.parse(responseBody))
        : null;

      this.logger.log(
        `Outgoing Response - ${method} ${originalUrl} ${statusCode} ${contentLength} - ${duration}ms`,
        sanitizedResponse
          ? `Response Body: ${JSON.stringify(sanitizedResponse)}`
          : '',
      );
    });

    next();
  }

  private sanitizeData(data: any): any {
    if (!data) return null;

    const sensitiveFields = [
      'password',
      'token',
      'authorization',
      'credit_card',
    ];
    const sanitized = { ...data };

    const sanitizeObject = (obj: any) => {
      Object.keys(obj).forEach((key) => {
        if (sensitiveFields.includes(key.toLowerCase())) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      });
    };

    sanitizeObject(sanitized);
    return sanitized;
  }
}
