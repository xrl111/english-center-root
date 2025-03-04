import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  app: {
    port: parseInt(process.env.PORT, 10) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV !== 'production',
    showErrorDetails: process.env.SHOW_ERROR_DETAILS === 'true',
    apiPrefix: '/api',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/english-center',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  auth: {
    saltRounds: parseInt(process.env.SALT_ROUNDS, 10) || 10,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
    destination: 'uploads/',
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10) || 587,
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    from: process.env.MAIL_FROM || 'noreply@englishcenter.com',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filename: process.env.LOG_FILE || 'app.log',
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 60, // seconds
    max: parseInt(process.env.CACHE_MAX, 10) || 100, // items
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  validation: {
    sanitize: true,
    validateCustomDecorators: true,
  },
};

export default config;