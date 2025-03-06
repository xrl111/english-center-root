import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLogger, LogMetadata } from '../services/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'];
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - startTime;

          const metadata: LogMetadata = {
            method,
            url,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            ip,
            userAgent,
          };

          // Log the request completion
          this.logger.debug(
            `${method} ${url} completed in ${duration}ms`,
            metadata
          );

          if (process.env.NODE_ENV === 'development') {
            // Log response data in development
            this.logger.debug(
              `${method} ${url} response payload`,
              {
                ...metadata,
                response: this.sanitizeData(data),
              }
            );
          }
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          
          const metadata: LogMetadata = {
            method,
            url,
            duration: `${duration}ms`,
            ip,
            userAgent,
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
          };

          this.logger.error(
            `${method} ${url} failed: ${error.message}`,
            metadata
          );
        },
      })
    );
  }

  private sanitizeData(data: any): any {
    if (!data) return data;

    // Create a copy of the data to avoid modifying the original
    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    // List of sensitive fields to remove
    const sensitiveFields = [
      'password',
      'token',
      'refreshToken',
      'authorization',
      'cookie',
      'jwt',
      'secret',
      'key',
    ];

    const sanitizeValue = (value: any): any => {
      if (!value) return value;

      if (Array.isArray(value)) {
        return value.map(item => sanitizeValue(item));
      }

      if (typeof value === 'object' && value !== null) {
        const sanitizedObj: Record<string, any> = {};
        for (const [key, val] of Object.entries(value)) {
          if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            sanitizedObj[key] = '[REDACTED]';
          } else {
            sanitizedObj[key] = sanitizeValue(val);
          }
        }
        return sanitizedObj;
      }

      return value;
    };

    return sanitizeValue(sanitized);
  }
}