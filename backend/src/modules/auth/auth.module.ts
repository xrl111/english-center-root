import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { RolesGuard } from './guards/roles.guard';
import { AdminGuard } from './guards/admin.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AppLogger } from '../../services/logger.service';
import config from '../../config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: config.jwt.secret,
      signOptions: { 
        expiresIn: config.jwt.expiresIn,
      },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    AdminGuard,
    JwtAuthGuard,
    AppLogger,
    {
      provide: 'JWT_CONFIG',
      useValue: {
        secret: config.jwt.secret,
        refreshSecret: config.jwt.refreshSecret,
        expiresIn: config.jwt.expiresIn,
        refreshExpiresIn: config.jwt.refreshExpiresIn,
      },
    },
  ],
  exports: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    AdminGuard,
    JwtAuthGuard,
    JwtModule,
  ],
})
export class AuthModule {}

// Re-export commonly used authentication components for convenience
export * from './strategies/jwt.strategy';
export * from './guards/jwt-auth.guard';
export * from './guards/roles.guard';
export * from './guards/admin.guard';
export * from './decorators/roles.decorator';
export * from './decorators/public.decorator';
export * from './decorators/resource-ownership.decorator';
export * from './types/roles';

// Export commonly used interfaces
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload extends JwtPayload {
  tokenVersion: number;
}

// Constants
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  ACCOUNT_DISABLED: 'Account is disabled',
  EMAIL_NOT_VERIFIED: 'Email is not verified',
  INVALID_TOKEN: 'Invalid or expired token',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
  TOKEN_REUSE_DETECTED: 'Token reuse detected',
} as const;

export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in',
  LOGOUT_SUCCESS: 'Successfully logged out',
  REFRESH_SUCCESS: 'Token successfully refreshed',
  REGISTER_SUCCESS: 'Successfully registered',
  PASSWORD_RESET_REQUEST: 'Password reset instructions sent',
  PASSWORD_RESET_SUCCESS: 'Password successfully reset',
  EMAIL_VERIFICATION_SENT: 'Verification email sent',
  EMAIL_VERIFIED: 'Email successfully verified',
} as const;

// Validation constants
export const PASSWORD_VALIDATION = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 50,
  PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  MESSAGE: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
} as const;

export const USERNAME_VALIDATION = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 30,
  PATTERN: /^[a-zA-Z0-9_-]*$/,
  MESSAGE: 'Username can only contain letters, numbers, underscores, and hyphens',
} as const;