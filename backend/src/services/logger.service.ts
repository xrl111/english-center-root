import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import config from '../config';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private context?: string;
  private logger: winston.Logger;

  constructor() {
    const { combine, timestamp, printf, colorize } = winston.format;

    // Custom log format
    const logFormat = printf(({ level, message, timestamp, context, ...meta }) => {
      return `${timestamp} [${level}] ${context ? `[${context}] ` : ''}${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ''
      }`;
    });

    // Configure logger with console and file transports
    this.logger = winston.createLogger({
      level: config.logging.level,
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
      transports: [
        // Console transport with colors
        new winston.transports.Console({
          format: combine(
            colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            logFormat
          ),
        }),
        // Daily rotate file transport
        new winston.transports.DailyRotateFile({
          filename: `logs/%DATE%-${config.logging.filename}`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, ...meta: any[]) {
    this.logger.info(message, { context: this.context, ...this.formatMeta(meta) });
  }

  error(message: string, trace?: string, ...meta: any[]) {
    this.logger.error(message, {
      context: this.context,
      trace,
      ...this.formatMeta(meta),
    });
  }

  warn(message: string, ...meta: any[]) {
    this.logger.warn(message, { context: this.context, ...this.formatMeta(meta) });
  }

  debug(message: string, ...meta: any[]) {
    this.logger.debug(message, { context: this.context, ...this.formatMeta(meta) });
  }

  verbose(message: string, ...meta: any[]) {
    this.logger.verbose(message, { context: this.context, ...this.formatMeta(meta) });
  }

  // Helper method to format metadata
  private formatMeta(meta: any[]): object {
    if (meta.length === 0) {
      return {};
    }

    // If the first item is an object, use it as metadata
    if (typeof meta[0] === 'object' && meta[0] !== null) {
      return this.sanitizeMetadata(meta[0]);
    }

    // Otherwise, combine all items into a metadata object
    return { data: meta };
  }

  // Sanitize metadata to prevent circular references and sensitive data
  private sanitizeMetadata(meta: any): object {
    const sanitized = {};
    for (const [key, value] of Object.entries(meta)) {
      // Skip null and undefined values
      if (value == null) continue;

      // Skip sensitive fields
      if (this.isSensitiveField(key)) continue;

      try {
        // Test if the value can be serialized
        JSON.stringify(value);
        sanitized[key] = value;
      } catch {
        // If value can't be serialized, convert to string
        sanitized[key] = String(value);
      }
    }
    return sanitized;
  }

  // Check if a field name suggests sensitive data
  private isSensitiveField(field: string): boolean {
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'auth',
      'key',
      'credential',
      'credit',
      'card',
      'ssn',
    ];
    return sensitiveFields.some(sensitive => 
      field.toLowerCase().includes(sensitive)
    );
  }

  // Helper method to log request details
  logRequest(req: any, res: any, duration: number) {
    const method = req.method;
    const url = req.originalUrl || req.url;
    const status = res.statusCode;
    const userAgent = req.get('user-agent') || '';
    const ip = req.ip || req.connection.remoteAddress;

    this.log(`${method} ${url} ${status} ${duration}ms`, {
      method,
      url,
      status,
      duration,
      userAgent,
      ip,
    });
  }

  // Helper method to log errors with stack traces
  logError(error: Error, req?: any) {
    const errorDetails = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    if (req) {
      errorDetails['request'] = {
        method: req.method,
        url: req.originalUrl || req.url,
        body: this.sanitizeMetadata(req.body),
        query: req.query,
        params: req.params,
        ip: req.ip || req.connection.remoteAddress,
      };
    }

    this.error('Error occurred', null, errorDetails);
  }
}