import { Request, Response, NextFunction } from 'express';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import config from '../config';

export class AppError extends HttpException {
  constructor(
    message: string,
    status: number = HttpStatus.INTERNAL_SERVER_ERROR,
    public code?: string,
    public details?: any
  ) {
    super(message, status);
  }
}

interface MongoErrorDetails {
  index: number;
  code: {
    [key: string]: any;
  };
}

export function errorMiddleware(
  error: Error | MongoError | HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isProd = process.env.NODE_ENV === 'production';
  let status = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let details = undefined;

  // Log error
  console.error('Error:', {
    path: req.path,
    method: req.method,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  });

  // Handle different types of errors
  if (error instanceof HttpException) {
    status = error.getStatus();
    const response = error.getResponse() as any;
    message = response.message || error.message;
    if (error instanceof AppError) {
      code = (error as AppError).code;
      details = (error as AppError).details;
    }
  } else if (error instanceof MongoError) {
    // Handle MongoDB specific errors
    if (error.code === 11000) {
      status = HttpStatus.CONFLICT;
      message = 'Duplicate key error';
      code = 'DUPLICATE_KEY';
      
      // Extract the duplicate key field
      const match = error.message.match(/index: (.+?)_/);
      const field = match ? match[1] : 'unknown field';
      details = { field };
    }
  } else if (error instanceof MongooseError.ValidationError) {
    // Handle Mongoose validation errors
    status = HttpStatus.BAD_REQUEST;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
    details = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      type: err.kind,
      value: err.value,
    }));
  } else if (error instanceof MongooseError.CastError) {
    // Handle Mongoose cast errors
    status = HttpStatus.BAD_REQUEST;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
    details = {
      field: error.path,
      value: error.value,
      type: error.kind,
    };
  }

  // Prepare response
  const errorResponse: any = {
    status: status,
    message: message,
    code: code,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  // Add details in development or if specifically allowed
  if (!isProd || config.app.showErrorDetails) {
    errorResponse.details = details;
    if (!isProd) {
      errorResponse.stack = error.stack;
    }
  }

  // Log error to monitoring service in production
  if (isProd && status === HttpStatus.INTERNAL_SERVER_ERROR) {
    // Implement error reporting service integration here
    // Example: Sentry.captureException(error);
  }

  res.status(status).json(errorResponse);
}

// Error handler for unhandled rejections and exceptions
export function setupErrorHandlers(app: any) {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: Error) => {
    console.error('Unhandled Promise Rejection:', reason);
    // Implement error reporting service integration here
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    // Implement error reporting service integration here
    // Gracefully shutdown the server
    app.close(() => {
      process.exit(1);
    });
  });
}

// Utility function to wrap async route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// HTTP error classes for common use cases
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details?: any) {
    super(message, HttpStatus.BAD_REQUEST, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: any) {
    super(message, HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: any) {
    super(message, HttpStatus.FORBIDDEN, 'FORBIDDEN', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found', details?: any) {
    super(message, HttpStatus.NOT_FOUND, 'NOT_FOUND', details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: any) {
    super(message, HttpStatus.CONFLICT, 'CONFLICT', details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Error', details?: any) {
    super(message, HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR', details);
  }
}