import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { MongoError } from 'mongodb';
import mongoose from 'mongoose';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  details?: any;
  timestamp: string;
  path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Server Error';
    let details = undefined;

    // Handle different types of errors
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse() as any;
      message = response.message || exception.message;
      error = response.error || 'Request Error';
      details = response.details;
    } else if (exception instanceof MongoError) {
      switch (exception.code) {
        case 11000:
          status = HttpStatus.CONFLICT;
          message = 'Duplicate key error';
          error = 'Database Error';
          details = this.formatDuplicateKeyError(exception);
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = 'Database operation failed';
          error = 'Database Error';
          break;
      }
    } else if (exception instanceof mongoose.Error.ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      error = 'Validation Error';
      details = this.formatValidationError(exception);
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      exception.stack
    );

    // Format the error response
    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Send the response
    response.status(status).json(errorResponse);
  }

  private formatValidationError(error: mongoose.Error.ValidationError): any {
    const formattedErrors: Record<string, string> = {};
    
    Object.keys(error.errors).forEach(key => {
      const validationError = error.errors[key];
      formattedErrors[key] = validationError.message;
    });

    return formattedErrors;
  }

  private formatDuplicateKeyError(error: MongoError): any {
    const keyPattern = (error as any).keyPattern;
    const keyValue = (error as any).keyValue;

    return {
      duplicateKeys: keyPattern ? Object.keys(keyPattern) : [],
      duplicateValues: keyValue || {},
    };
  }
}

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly error: string = 'Application Error',
    public readonly details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.BAD_REQUEST, 'Validation Error', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.UNAUTHORIZED, 'Authentication Error', details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.FORBIDDEN, 'Authorization Error', details);
    this.name = 'AuthorizationError';
  }
}

export class ResourceNotFoundError extends AppError {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.NOT_FOUND, 'Resource Not Found', details);
    this.name = 'ResourceNotFoundError';
  }
}

export class DuplicateResourceError extends AppError {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.CONFLICT, 'Duplicate Resource', details);
    this.name = 'DuplicateResourceError';
  }
}