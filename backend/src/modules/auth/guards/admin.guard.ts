import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../types/roles';
import { RolesGuard } from './roles.guard';
import { RequestWithUser } from '../types/common';
import { AppLogger } from '../../../services/logger.service';

@Injectable()
export class AdminGuard extends RolesGuard {
  private readonly logger: AppLogger;

  constructor(
    reflector: Reflector,
    logger: AppLogger
  ) {
    super(reflector);
    this.logger = logger;
    this.logger.setContext('AdminGuard');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // First check if user is authenticated
    if (!user) {
      throw new UnauthorizedException('User is not authenticated');
    }

    // Check if user is an admin
    if (user.role !== UserRole.ADMIN) {
      this.logger.warn(`Unauthorized admin access attempt by user ${user.id} with role ${user.role}`);
      throw new ForbiddenException('Only administrators can access this resource');
    }

    // Additional security checks for admin actions
    await this.performAdminSecurityChecks(user, request);

    // Log successful admin access
    this.logger.log(`Admin access granted to user ${user.id} for ${request.method} ${request.url}`);

    return true;
  }

  private async performAdminSecurityChecks(user: RequestWithUser['user'], request: any): Promise<void> {
    // Check if the admin account is fully verified
    if (!user.isEmailVerified) {
      throw new ForbiddenException('Admin account email must be verified');
    }

    // Check if the admin account is active
    if (!user.isActive) {
      throw new ForbiddenException('Admin account is not active');
    }

    // Check for suspicious activity
    if (this.isSuspiciousActivity(request)) {
      this.logger.warn(`Suspicious admin activity detected for user ${user.id}`, {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        method: request.method,
        path: request.path,
      });
      throw new ForbiddenException('Suspicious activity detected');
    }
  }

  private isSuspiciousActivity(request: any): boolean {
    // Implement suspicious activity detection logic
    // For example:
    // - Unusual access patterns
    // - Multiple failed attempts
    // - Access from suspicious IPs
    // - Unusual time of access
    // - etc.

    const suspiciousPatterns = [
      this.isUnusualAccessTime(),
      this.isKnownMaliciousIP(request.ip),
      this.hasMultipleFailedAttempts(request.ip),
    ];

    return suspiciousPatterns.some(Boolean);
  }

  private isUnusualAccessTime(): boolean {
    const hour = new Date().getHours();
    // Consider access between 11 PM and 5 AM as unusual
    return hour >= 23 || hour <= 5;
  }

  private isKnownMaliciousIP(ip: string): boolean {
    // Implement IP blacklist check
    // This could be connected to a security service or database
    const blacklistedIPs: string[] = [
      // Add known malicious IPs
    ];
    return blacklistedIPs.includes(ip);
  }

  private hasMultipleFailedAttempts(ip: string): boolean {
    // Implement failed attempts tracking
    // This should be connected to a rate limiting service
    return false;
  }

  /**
   * Decorator factory for requiring admin role with specific permissions
   */
  static requirePermissions(...permissions: string[]) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      
      descriptor.value = async function (...args: any[]) {
        const user = this.request?.user;
        
        if (!user || user.role !== UserRole.ADMIN) {
          throw new ForbiddenException('Admin access required');
        }

        // Check specific permissions
        if (permissions.length > 0) {
          const hasPermissions = permissions.every(permission => 
            user.permissions?.includes(permission)
          );
          
          if (!hasPermissions) {
            throw new ForbiddenException('Insufficient admin permissions');
          }
        }

        return originalMethod.apply(this, args);
      };

      return descriptor;
    };
  }
}