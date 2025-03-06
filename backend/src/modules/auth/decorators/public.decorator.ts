import { SetMetadata, CustomDecorator } from '@nestjs/common';

/**
 * Key for public route metadata
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark routes as public (no authentication required)
 */
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Key for rate limit override metadata
 */
export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * Interface for rate limit options
 */
export interface RateLimitOptions {
  points: number;      // Number of points
  duration: number;    // Duration in seconds
  blockDuration?: number; // Block duration in seconds
}

/**
 * Decorator to override rate limiting for public routes
 */
export const PublicRateLimit = (options: RateLimitOptions): CustomDecorator =>
  SetMetadata(RATE_LIMIT_KEY, options);

/**
 * Key for caching metadata
 */
export const CACHE_KEY = 'cache';

/**
 * Interface for cache options
 */
export interface CacheOptions {
  ttl: number;        // Time to live in seconds
  key?: string;       // Custom cache key
}

/**
 * Decorator to enable caching for public routes
 */
export const PublicCache = (options: CacheOptions): CustomDecorator =>
  SetMetadata(CACHE_KEY, options);

/**
 * Key for request validation metadata
 */
export const VALIDATION_KEY = 'validation';

/**
 * Interface for validation options
 */
export interface ValidationOptions {
  skipMissingProperties?: boolean;
  whitelist?: boolean;
  forbidNonWhitelisted?: boolean;
}

/**
 * Decorator to configure validation for public routes
 */
export const PublicValidation = (options: ValidationOptions): CustomDecorator =>
  SetMetadata(VALIDATION_KEY, options);

/**
 * Combined decorator for common public endpoint configuration
 */
export interface PublicEndpointOptions {
  rateLimit?: RateLimitOptions;
  cache?: CacheOptions;
  validation?: ValidationOptions;
}

/**
 * Apply multiple decorators in a type-safe way
 */
function applyDecorators(...decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>) {
  return <TFunction extends Function, Y>(
    target: TFunction | object,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<Y>
  ) => {
    for (const decorator of decorators) {
      if (target instanceof Function && !descriptor) {
        (decorator as ClassDecorator)(target);
      } else if (descriptor) {
        (decorator as MethodDecorator)(target as object, propertyKey!, descriptor);
      } else {
        (decorator as PropertyDecorator)(target, propertyKey!);
      }
    }
  };
}

/**
 * Combined decorator for public endpoints with optional configuration
 * 
 * @example
 * ```typescript
 * @PublicEndpoint({
 *   rateLimit: { points: 10, duration: 60 },
 *   cache: { ttl: 300 },
 *   validation: { whitelist: true }
 * })
 * @Get('public-endpoint')
 * publicEndpoint() {
 *   return 'Public endpoint with configuration';
 * }
 * ```
 */
export const PublicEndpoint = (options: PublicEndpointOptions = {}) => {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    Public(),
  ];

  if (options.rateLimit) {
    decorators.push(PublicRateLimit(options.rateLimit) as MethodDecorator);
  }

  if (options.cache) {
    decorators.push(PublicCache(options.cache) as MethodDecorator);
  }

  if (options.validation) {
    decorators.push(PublicValidation(options.validation) as MethodDecorator);
  }

  return applyDecorators(...decorators);
};