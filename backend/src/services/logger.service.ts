import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { Transport } from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

export type LogMetadata = Record<string, any>;

@Injectable()
export class AppLogger implements LoggerService {
  private logger!: winston.Logger;
  private context?: string;

  constructor(private configService: ConfigService) {
    this.initializeLogger();
  }

  private initializeLogger() {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const logDir = this.configService.get('LOG_DIR', 'logs');
    const logLevel = this.configService.get('LOG_LEVEL', 'info');

    // Create custom format
    const customFormat = winston.format.printf(
      ({ timestamp, level, message, metadata }) => {
        const metaString = metadata
          ? `\n${JSON.stringify(metadata, null, 2)}`
          : '';
        return `${timestamp} ${level}: ${message}${metaString}`;
      }
    );

    // Configure transports
    const transports: Transport[] = [
      // Console transport
      new winston.transports.Console({
        level: logLevel,
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          customFormat
        ),
      }),
    ];

    // Add file transport in production
    if (isProduction) {
      const DailyRotateFile = require('winston-daily-rotate-file');

      transports.push(
        new DailyRotateFile({
          dirname: path.join(process.cwd(), logDir),
          filename: 'application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }) as Transport,
        new DailyRotateFile({
          dirname: path.join(process.cwd(), logDir),
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }) as Transport
      );
    }

    // Create logger instance
    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: {
        environment: this.configService.get('NODE_ENV'),
        service: 'learning-platform',
      },
      transports,
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  private formatMessage(
    message: string,
    metadata?: LogMetadata
  ): { message: string; metadata: LogMetadata } {
    return {
      message,
      metadata: {
        ...metadata,
        context: this.context,
        timestamp: new Date().toISOString(),
      },
    };
  }

  log(message: string, metadata?: LogMetadata) {
    const formatted = this.formatMessage(message, metadata);
    this.logger.info(formatted.message, { metadata: formatted.metadata });
  }

  error(message: string, metadata?: LogMetadata) {
    const formatted = this.formatMessage(message, metadata);
    this.logger.error(formatted.message, { metadata: formatted.metadata });
  }

  warn(message: string, metadata?: LogMetadata) {
    const formatted = this.formatMessage(message, metadata);
    this.logger.warn(formatted.message, { metadata: formatted.metadata });
  }

  debug(message: string, metadata?: LogMetadata) {
    const formatted = this.formatMessage(message, metadata);
    this.logger.debug(formatted.message, { metadata: formatted.metadata });
  }

  verbose(message: string, metadata?: LogMetadata) {
    const formatted = this.formatMessage(message, metadata);
    this.logger.verbose(formatted.message, { metadata: formatted.metadata });
  }
}
