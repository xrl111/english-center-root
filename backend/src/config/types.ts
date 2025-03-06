import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export interface DatabaseConfig {
  uri: string;
  options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
    autoIndex: boolean;
  };
}

export interface JwtConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface AuthConfig {
  saltRounds: number;
  resetPasswordExpiry: number;
  verificationExpiry: number;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface UploadConfig {
  destination: string; // Alias for dest
  maxFileSize: number; // Alias for maxSize
  allowedMimeTypes: string[]; // Alias for allowedMimes
  dest: string;
  maxSize: number;
  allowedMimes: string[];
}

export interface CacheConfig {
  ttl: number;
  max: number;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export interface LoggingConfig {
  level: string;
  format: string;
  dir: string;
  filename: string;
}

export interface CorsConfig {
  origin: string[];
  credentials: boolean;
}

export interface SwaggerConfig {
  title: string;
  description: string;
  version: string;
  tag: string;
}

export interface ValidationConfig {
  whitelist: boolean;
  forbidNonWhitelisted: boolean;
  transform: boolean;
  transformOptions: {
    enableImplicitConversion: boolean;
  };
}

export interface AppConfig {
  name: string;
  description: string;
  version: string;
  host: string;
  env: string;
}

export interface SecurityConfig {
  bcryptSaltRounds: number;
  sessionSecret: string;
  cookieSecret: string;
}

export interface MulterConfigOptions extends MulterOptions {
  dest: string;
  limits: {
    fileSize: number;
  };
  fileFilter: (req: any, file: any, cb: any) => void;
}

export interface FeatureFlags {
  emailVerification: boolean;
  socialAuth: boolean;
  fileUpload: boolean;
  chat: boolean;
}

export interface Config {
  port: number;
  nodeEnv: string;
  apiPrefix: string;
  database: DatabaseConfig;
  jwt: JwtConfig;
  auth: AuthConfig;
  email: EmailConfig;
  upload: UploadConfig;
  cache: CacheConfig;
  rateLimit: RateLimitConfig;
  logging: LoggingConfig;
  cors: CorsConfig;
  swagger: SwaggerConfig;
  cookie: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
  };
  validation: ValidationConfig;
  app: AppConfig;
  security: SecurityConfig;
  features: FeatureFlags;
  multer: MulterConfigOptions;
}

// Type guard for environment variables
export function isValidNodeEnv(env: string): env is 'development' | 'production' | 'test' {
  return ['development', 'production', 'test'].includes(env);
}

// Type guard for logging levels
export function isValidLogLevel(level: string): level is 'error' | 'warn' | 'info' | 'debug' {
  return ['error', 'warn', 'info', 'debug'].includes(level);
}

// Type guard for MIME types
export function isValidMimeType(mime: string): boolean {
  return /^[a-z]+\/[a-z0-9\-\+\.]+$/.test(mime) || mime === '*/*' || /^[a-z]+\/\*$/.test(mime);
}

export const DEFAULT_CONFIG: Partial<Config> = {
  validation: {
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  },
  logging: {
    level: 'info',
    format: 'combined',
    dir: 'logs',
    filename: 'app-%DATE%.log',
  },
  app: {
    name: 'Learning Platform API',
    description: 'Backend API for Learning Platform',
    version: '1.0.0',
    host: 'localhost',
    env: 'development',
  },
};