import * as dotenv from 'dotenv';
import { join } from 'path';
import {
  Config,
  DEFAULT_CONFIG,
  isValidNodeEnv,
  isValidLogLevel,
  isValidMimeType,
} from './types';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path: join(process.cwd(), envFile) });

function validateConfig(config: Partial<Config>): asserts config is Config {
  const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

function parseArrayValue(value: string): string[] {
  return value.split(',').map((item) => item.trim());
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: isValidNodeEnv(process.env.NODE_ENV || 'development')
    ? process.env.NODE_ENV || 'development'
    : 'development',
  apiPrefix: process.env.API_PREFIX || 'api',

  database: {
    uri:
      process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-platform',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true,
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  auth: {
    saltRounds: Number(process.env.AUTH_SALT_ROUNDS) || 10,
    resetPasswordExpiry: Number(process.env.RESET_PASSWORD_EXPIRY) || 3600000,
    verificationExpiry: Number(process.env.VERIFICATION_EXPIRY) || 86400000,
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
    },
    from: process.env.EMAIL_FROM || 'noreply@learning-platform.com',
  },

  upload: {
    destination: join(
      __dirname,
      '../../',
      process.env.UPLOAD_DEST || 'uploads'
    ),
    maxFileSize: Number(process.env.UPLOAD_MAX_SIZE) || 5242880,
    allowedMimeTypes: process.env.UPLOAD_ALLOWED_MIMES?.split(',')
      .map((mime) => mime.trim())
      .filter(isValidMimeType) || ['image/*', 'application/pdf'],
    dest: join(__dirname, '../../', process.env.UPLOAD_DEST || 'uploads'),
    maxSize: Number(process.env.UPLOAD_MAX_SIZE) || 5242880,
    allowedMimes: process.env.UPLOAD_ALLOWED_MIMES?.split(',')
      .map((mime) => mime.trim())
      .filter(isValidMimeType) || ['image/*', 'application/pdf'],
  },

  cache: {
    ttl: Number(process.env.CACHE_TTL) || 300,
    max: Number(process.env.CACHE_MAX) || 100,
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW) || 900000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
  },

  logging: {
    level: isValidLogLevel(process.env.LOG_LEVEL || 'info')
      ? process.env.LOG_LEVEL || 'info'
      : 'info',
    format: process.env.LOG_FORMAT || 'combined',
    dir: process.env.LOG_DIR || join(__dirname, '../../logs'),
    filename: 'app-%DATE%.log',
  },

  cors: {
    origin: parseArrayValue(process.env.CORS_ORIGIN || 'http://localhost:3000'),
    credentials: true,
  },

  swagger: {
    title: 'Learning Platform API',
    description: 'Learning Platform API documentation',
    version: '1.0',
    tag: process.env.API_TAG || 'api',
  },

  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },

  validation: DEFAULT_CONFIG.validation!,

  app: {
    ...DEFAULT_CONFIG.app!,
    env: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost',
  },

  security: {
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
    sessionSecret: process.env.SESSION_SECRET || 'session-secret',
    cookieSecret: process.env.COOKIE_SECRET || 'cookie-secret',
  },

  features: {
    emailVerification: process.env.FEATURE_EMAIL_VERIFICATION === 'true',
    socialAuth: process.env.FEATURE_SOCIAL_AUTH === 'true',
    fileUpload: process.env.FEATURE_FILE_UPLOAD === 'true',
    chat: process.env.FEATURE_CHAT === 'true',
  },

  multer: {
    dest: join(__dirname, '../../', process.env.UPLOAD_DEST || 'uploads'),
    limits: {
      fileSize: Number(process.env.UPLOAD_MAX_SIZE) || 5242880,
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = parseArrayValue(
        process.env.UPLOAD_ALLOWED_MIMES || 'image/*,application/pdf'
      );
      const isValid = allowedMimes.some((mime) => {
        if (mime.endsWith('/*')) {
          const type = mime.split('/')[0];
          return file.mimetype.startsWith(`${type}/`);
        }
        return file.mimetype === mime;
      });
      cb(null, isValid);
    },
  },
};

// Validate the configuration
validateConfig(config);

export default config;
