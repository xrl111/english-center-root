import { Request } from 'express';
import { UserRole } from './roles';

export interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
  [key: string]: any;
}

export interface RequestWithUser extends Request {
  user: UserPayload;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface BaseUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  enrolledCourses: string[];
  instructingCourses: string[];
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload extends JwtPayload {
  tokenVersion: number;
}

export interface Resource {
  id: string;
  userId?: string;
  course?: string;
  [key: string]: any;
}

export interface ResourceOwnership {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  conditions?: {
    isOwner?: boolean;
    isInstructor?: boolean;
    isEnrolled?: boolean;
    custom?: (user: BaseUser, resource: Resource) => boolean;
  };
}

export interface AuthProvider {
  name: string;
  id: string;
  email: string;
  picture?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface AuthConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
  emailVerificationExpiration: string;
  passwordResetExpiration: string;
  providers: {
    google?: {
      clientId: string;
      clientSecret: string;
      callbackURL: string;
    };
    facebook?: {
      appId: string;
      appSecret: string;
      callbackURL: string;
    };
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    isEmailVerified: boolean;
    [key: string]: any;
  };
}

export interface LoginAttempt {
  email: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
}

export interface SecurityLog {
  userId?: string;
  action: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export enum AuthAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  VERIFY_EMAIL = 'verify_email',
  RESET_PASSWORD = 'reset_password',
  CHANGE_PASSWORD = 'change_password',
  UPDATE_PROFILE = 'update_profile',
  REFRESH_TOKEN = 'refresh_token',
}

export enum AuthEvent {
  LOGIN_SUCCESS = 'auth.login.success',
  LOGIN_FAILURE = 'auth.login.failure',
  LOGOUT = 'auth.logout',
  REGISTER = 'auth.register',
  EMAIL_VERIFICATION = 'auth.email.verify',
  PASSWORD_RESET = 'auth.password.reset',
  TOKEN_REFRESH = 'auth.token.refresh',
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_DISABLED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'REFRESH_TOKEN_EXPIRED'
  | 'REFRESH_TOKEN_INVALID'
  | 'PASSWORD_MISMATCH'
  | 'EMAIL_ALREADY_EXISTS'
  | 'USERNAME_ALREADY_EXISTS'
  | 'INVALID_RESET_TOKEN'
  | 'RESET_TOKEN_EXPIRED'
  | 'PROVIDER_ERROR';

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthError';
  }
}