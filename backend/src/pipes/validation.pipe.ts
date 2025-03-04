import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import config from '../config';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: config.validation.sanitize,
      validateCustomDecorators: config.validation.validateCustomDecorators,
    });

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new BadRequestException({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: formattedErrors,
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]) {
    return errors.map(err => {
      const constraints = err.constraints
        ? Object.values(err.constraints)
        : ['Invalid value'];

      return {
        field: err.property,
        messages: constraints,
        value: err.value,
        children: err.children?.length
          ? this.formatErrors(err.children)
          : undefined,
      };
    });
  }
}

// Custom validators
export function IsPasswordStrong() {
  return function(object: Object, propertyName: string) {
    const password = object[propertyName];
    if (password && typeof password === 'string') {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      if (
        !hasUpperCase ||
        !hasLowerCase ||
        !hasNumbers ||
        !hasSpecialChar ||
        password.length < 8
      ) {
        throw new BadRequestException({
          message: 'Password is not strong enough',
          code: 'WEAK_PASSWORD',
          details: {
            field: propertyName,
            requirements: {
              uppercase: hasUpperCase,
              lowercase: hasLowerCase,
              numbers: hasNumbers,
              specialChar: hasSpecialChar,
              minLength: password.length >= 8,
            },
          },
        });
      }
    }
  };
}

// Custom decorators for common validations
export function IsPhoneNumber() {
  return function(object: Object, propertyName: string) {
    const phone = object[propertyName];
    if (phone && typeof phone === 'string') {
      const isValid = /^\+?[\d\s-()]+$/.test(phone);
      if (!isValid) {
        throw new BadRequestException({
          message: 'Invalid phone number format',
          code: 'INVALID_PHONE',
          details: {
            field: propertyName,
            value: phone,
          },
        });
      }
    }
  };
}

export function IsOptionalUrl() {
  return function(object: Object, propertyName: string) {
    const url = object[propertyName];
    if (url && typeof url === 'string') {
      try {
        new URL(url);
      } catch {
        throw new BadRequestException({
          message: 'Invalid URL format',
          code: 'INVALID_URL',
          details: {
            field: propertyName,
            value: url,
          },
        });
      }
    }
  };
}

export function IsDateRange(startDateField: string, endDateField: string) {
  return function(object: Object) {
    const startDate = new Date(object[startDateField]);
    const endDate = new Date(object[endDateField]);

    if (startDate && endDate && startDate >= endDate) {
      throw new BadRequestException({
        message: 'End date must be after start date',
        code: 'INVALID_DATE_RANGE',
        details: {
          startDate: object[startDateField],
          endDate: object[endDateField],
        },
      });
    }
  };
}