import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
  details?: any;
}

interface HttpExceptionResponse {
  message: string | string[];
  [key: string]: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  private readonly mongoErrorMap: Record<number, { status: number; message: string }> = {
    11000: { status: HttpStatus.CONFLICT, message: 'Duplicate key error' },
  };

  private createErrorResponse(
    status: number,
    message: string | string[],
    path: string,
    details?: any
  ): ErrorResponse {
    return {
      statusCode: status,
      message,
      error: HttpStatus[status] || 'Internal Server Error',
      path,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
    };
  }

  catch(error: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.url;

    let responseBody: ErrorResponse;

    if (error instanceof HttpException) {
      const status = error.getStatus();
      const errorResponse = error.getResponse() as string | HttpExceptionResponse;

      const message = typeof errorResponse === 'string'
        ? errorResponse
        : errorResponse.message;

      responseBody = this.createErrorResponse(status, message, path);
    } else if (error instanceof MongoError) {
      const mongoError = this.handleMongoError(error);
      responseBody = this.createErrorResponse(
        mongoError.status,
        mongoError.message,
        path,
        error.message
      );
    } else if (error instanceof MongooseError) {
      responseBody = this.createErrorResponse(
        HttpStatus.BAD_REQUEST,
        'Validation error',
        path,
        error.message
      );
    } else {
      // Unexpected errors
      this.logger.error(error.message, error.stack);
      responseBody = this.createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal server error',
        path
      );
    }

    // Log the error
    this.logger.error(
      `${responseBody.statusCode} - ${request.method} ${path}`,
      {
        error: responseBody,
        stack: error.stack,
      }
    );

    // Send response
    response.status(responseBody.statusCode).json(responseBody);
  }

  private handleMongoError(error: MongoError): { status: number; message: string } {
    const errorCode = error.code || 0;
    const mappedError = errorCode in this.mongoErrorMap 
      ? this.mongoErrorMap[errorCode as keyof typeof this.mongoErrorMap]
      : null;

    if (mappedError) {
      return mappedError;
    }

    // Default error handling
    return {
      status: HttpStatus.BAD_REQUEST,
      message: 'Database operation failed',
    };
  }
}