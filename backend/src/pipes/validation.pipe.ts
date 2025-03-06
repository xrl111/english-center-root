import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ValidationConfig } from '../config/types';
import config from '../config';

interface ValidationErrorResponse {
  [key: string]: string[] | ValidationErrorResponse;
}

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  private readonly validationOptions: ValidationConfig;

  constructor() {
    this.validationOptions = {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    };
  }

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object, this.validationOptions);

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ValidationError[]): ValidationErrorResponse {
    return errors.reduce((acc: ValidationErrorResponse, error: ValidationError) => {
      const { property, constraints, children } = error;

      if (constraints) {
        acc[property] = Object.values(constraints);
      }

      if (children && children.length > 0) {
        acc[property] = this.formatErrors(children);
      }

      return acc;
    }, {});
  }

  private getConstraintMessage(constraint: string, value: any): string {
    const messages: Record<string, (val: any) => string> = {
      isNotEmpty: () => 'This field cannot be empty',
      isString: () => 'This field must be a string',
      isNumber: () => 'This field must be a number',
      isBoolean: () => 'This field must be a boolean',
      isEmail: () => 'Invalid email address',
      isDate: () => 'Invalid date format',
      min: (val) => `Value must be greater than or equal to ${val}`,
      max: (val) => `Value must be less than or equal to ${val}`,
      minLength: (val) => `Minimum length is ${val} characters`,
      maxLength: (val) => `Maximum length is ${val} characters`,
      isEnum: (val) => `Invalid value. Must be one of: ${Array.isArray(val) ? val.join(', ') : val}`,
      matches: () => 'Invalid format',
      isMongoId: () => 'Invalid ID format',
      isUrl: () => 'Invalid URL format',
      isIP: () => 'Invalid IP address',
      isUUID: () => 'Invalid UUID format',
      isJSON: () => 'Invalid JSON format',
    };

    const messageGenerator = messages[constraint];
    return messageGenerator ? messageGenerator(value) : 'Invalid value';
  }

  private formatConstraintName(constraint: string): string {
    return constraint
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/^./, (str) => str.toUpperCase());
  }

  private formatPropertyName(property: string): string {
    return property
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/^./, (str) => str.toUpperCase());
  }

  private getValidationOptions() {
    return {
      ...this.validationOptions,
      ...(config.validation || {}),
    };
  }
}