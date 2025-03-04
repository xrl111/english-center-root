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
import { Error as MongooseError } from 'mongoose';

interface MongoErrorExt extends MongoError {
  keyPattern?: { [key: string]: number };
  keyValue?: { [key: string]: any };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details = null;

    // Handle different types of errors
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      
      if (typeof errorResponse === 'object') {
        message = (errorResponse as any).message || exception.message;
        details = (errorResponse as any).details || null;
      } else {
        message = errorResponse;
      }
    } else if (exception instanceof MongoError) {
      // Handle MongoDB specific errors
      if (exception.code === 11000) {
        status = HttpStatus.CONFLICT;
        message = 'Duplicate entry';
        details = this.formatDuplicateKeyError(exception as MongoErrorExt);
      }
    } else if (exception instanceof MongooseError.ValidationError) {
      // Handle Mongoose validation errors
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = 'Validation error';
      details = this.formatValidationError(exception);
    }

    // Add request details to error log
    const request = ctx.getRequest();
    const errorLog = {
      status,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      headers: request.headers,
      body: request.body,
      params: request.params,
      query: request.query,
      stack: exception.stack,
    };

    // Log the error
    if (status >= 500) {
      this.logger.error(errorLog);
    } else {
      this.logger.warn(errorLog);
    }

    // Send response
    response.status(status).json({
      statusCode: status,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private formatValidationError(error: MongooseError.ValidationError) {
    const formattedErrors = {};
    
    Object.keys(error.errors).forEach((key) => {
      const err = error.errors[key];
      formattedErrors[key] = err.message;
    });

    return formattedErrors;
  }

  private formatDuplicateKeyError(error: MongoErrorExt) {
    if (error.keyValue) {
      const field = Object.keys(error.keyValue)[0];
      return {
        [field]: `This ${field} is already in use`,
      };
    }
    
    if (error.keyPattern) {
      const field = Object.keys(error.keyPattern)[0];
      return {
        [field]: `This ${field} is already in use`,
      };
    }

    return { error: 'Duplicate entry detected' };
  }
}