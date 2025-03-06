import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AppLogger } from '../../../services/logger.service';

interface LogContext {
  message?: string;
  errorDetails?: string;
  tokenError?: string;
  userId?: string;
  ip?: string;
  method?: string;
  path?: string;
  role?: string;
  [key: string]: any;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    protected readonly logger: AppLogger
  ) {
    super();
    this.logger.setContext('JwtAuthGuard');
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    const request = context.switchToHttp().getRequest();
    const { ip, method, path } = request;
    const logContext: LogContext = { ip, method, path };

    // If there's an error or no user was found
    if (err || !user) {
      const error = err || new UnauthorizedException('Invalid token or no token provided');
      logContext.errorDetails = err?.message;
      logContext.tokenError = info?.message;

      this.logger.warn('Authentication failed', logContext);
      throw error;
    }

    // Check if user account is active
    if (!user.isActive) {
      logContext.userId = user.id;
      this.logger.warn('Inactive user attempted access', logContext);
      throw new UnauthorizedException('User account is inactive');
    }

    // Log successful authentication
    logContext.userId = user.id;
    this.logger.debug('Authentication successful', logContext);

    return user;
  }

  protected handleAuthenticationError(error: any, context: ExecutionContext): never {
    const request = context.switchToHttp().getRequest();
    const { ip, method, path } = request;
    const logContext: LogContext = {
      message: error.message,
      errorType: error.name,
      stack: error.stack,
      ip,
      method,
      path,
    };

    this.logger.error('Authentication error', logContext);

    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Token has expired');
    }

    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedException('Invalid token');
    }

    throw new UnauthorizedException('Authentication failed');
  }
}

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    try {
      return super.handleRequest(err, user, info, context, status);
    } catch (error) {
      // Don't throw error for optional authentication
      return undefined;
    }
  }
}

@Injectable()
export class StrictJwtAuthGuard extends JwtAuthGuard {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    const authenticatedUser = super.handleRequest(err, user, info, context, status);

    if (!authenticatedUser) {
      throw new UnauthorizedException('Authentication required');
    }

    // Additional security checks
    this.performSecurityChecks(authenticatedUser, context);

    return authenticatedUser;
  }

  private performSecurityChecks(user: any, context: ExecutionContext): void {
    const request = context.switchToHttp().getRequest();
    const { ip } = request;
    const logContext: LogContext = {
      userId: user.id,
      role: user.role,
      ip,
    };

    // Check for required user properties
    if (!user.email || !user.role) {
      this.logger.warn('Invalid user data detected', logContext);
      throw new UnauthorizedException('Invalid user data');
    }

    // Check if user has required email verification
    if (!user.isEmailVerified) {
      this.logger.warn('Unverified email access attempt', logContext);
      throw new UnauthorizedException('Email verification required');
    }

    // Check if user's session is valid
    if (user.sessionExpired) {
      this.logger.warn('Expired session access attempt', logContext);
      throw new UnauthorizedException('Session has expired');
    }

    // Log successful security check
    this.logger.debug('Security checks passed', logContext);
  }
}

// Factory function to create appropriate JWT guard
export function createJwtAuthGuard(options: {
  optional?: boolean;
  strict?: boolean;
} = {}): typeof JwtAuthGuard {
  if (options.optional) {
    return OptionalJwtAuthGuard;
  }
  if (options.strict) {
    return StrictJwtAuthGuard;
  }
  return JwtAuthGuard;
}

// Export guard providers for module registration
export const JwtAuthGuardProviders = [
  JwtAuthGuard,
  OptionalJwtAuthGuard,
  StrictJwtAuthGuard,
];