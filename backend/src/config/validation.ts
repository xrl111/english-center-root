import { plainToClass } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsEnum,
  validateSync,
  IsOptional,
  Min,
  Max,
  IsBoolean,
  ValidationError,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsString()
  MONGODB_URI!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsInt()
  @Min(60)
  JWT_EXPIRATION!: number;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsInt()
  @Min(60)
  JWT_REFRESH_EXPIRATION!: number;

  @IsString()
  ADMIN_EMAIL!: string;

  @IsString()
  ADMIN_PASSWORD!: string;

  @IsString()
  @IsOptional()
  ADMIN_USERNAME?: string;

  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;

  @IsBoolean()
  @IsOptional()
  SWAGGER_ENABLED?: boolean;

  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsInt()
  @IsOptional()
  SMTP_PORT?: number;

  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASS?: string;

  @IsString()
  @IsOptional()
  SMTP_FROM?: string;

  @IsString()
  @IsOptional()
  REDIS_URI?: string;

  @IsBoolean()
  @IsOptional()
  RATE_LIMIT_ENABLED?: boolean;

  @IsInt()
  @IsOptional()
  RATE_LIMIT_WINDOW?: number;

  @IsInt()
  @IsOptional()
  RATE_LIMIT_MAX?: number;

  @IsBoolean()
  @IsOptional()
  CACHE_ENABLED?: boolean;

  @IsInt()
  @IsOptional()
  CACHE_TTL?: number;
}

function parseEnvValue<T>(value: string | undefined, defaultValue: T): T {
  if (value === undefined) {
    return defaultValue;
  }

  switch (typeof defaultValue) {
    case 'number':
      return Number(value) as T;
    case 'boolean':
      return (value.toLowerCase() === 'true') as unknown as T;
    default:
      return value as unknown as T;
  }
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessage = formatValidationErrors(errors);
    throw new Error(`Configuration validation failed: ${errorMessage}`);
  }

  return validatedConfig;
}

function formatValidationErrors(errors: ValidationError[]): string {
  return errors
    .map((error) => {
      if (error.constraints) {
        return Object.values(error.constraints).join(', ');
      }
      return `Invalid value for ${error.property}`;
    })
    .join('; ');
}

export function getDefaultConfig(): Partial<EnvironmentVariables> {
  return {
    NODE_ENV: Environment.Development,
    PORT: 3000,
    SWAGGER_ENABLED: true,
    RATE_LIMIT_ENABLED: true,
    RATE_LIMIT_WINDOW: 15 * 60, // 15 minutes
    RATE_LIMIT_MAX: 100,
    CACHE_ENABLED: true,
    CACHE_TTL: 60 * 60, // 1 hour
    JWT_EXPIRATION: 60 * 60, // 1 hour
    JWT_REFRESH_EXPIRATION: 7 * 24 * 60 * 60, // 7 days
  };
}

export function getMergedConfig(): EnvironmentVariables {
  const defaultConfig = getDefaultConfig();
  const envConfig = {
    ...defaultConfig,
    NODE_ENV: parseEnvValue(process.env.NODE_ENV, defaultConfig.NODE_ENV),
    PORT: parseEnvValue(process.env.PORT, defaultConfig.PORT),
    MONGODB_URI: process.env.MONGODB_URI || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
    JWT_EXPIRATION: parseEnvValue(
      process.env.JWT_EXPIRATION,
      defaultConfig.JWT_EXPIRATION
    ),
    JWT_REFRESH_EXPIRATION: parseEnvValue(
      process.env.JWT_REFRESH_EXPIRATION,
      defaultConfig.JWT_REFRESH_EXPIRATION
    ),
    SWAGGER_ENABLED: parseEnvValue(
      process.env.SWAGGER_ENABLED,
      defaultConfig.SWAGGER_ENABLED
    ),
    RATE_LIMIT_ENABLED: parseEnvValue(
      process.env.RATE_LIMIT_ENABLED,
      defaultConfig.RATE_LIMIT_ENABLED
    ),
    RATE_LIMIT_WINDOW: parseEnvValue(
      process.env.RATE_LIMIT_WINDOW,
      defaultConfig.RATE_LIMIT_WINDOW
    ),
    RATE_LIMIT_MAX: parseEnvValue(
      process.env.RATE_LIMIT_MAX,
      defaultConfig.RATE_LIMIT_MAX
    ),
    CACHE_ENABLED: parseEnvValue(
      process.env.CACHE_ENABLED,
      defaultConfig.CACHE_ENABLED
    ),
    CACHE_TTL: parseEnvValue(process.env.CACHE_TTL, defaultConfig.CACHE_TTL),
    // Optional values
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT
      ? parseInt(process.env.SMTP_PORT)
      : undefined,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    REDIS_URI: process.env.REDIS_URI,
  };

  return validate(envConfig);
}

export type Config = EnvironmentVariables;
export { Environment };
