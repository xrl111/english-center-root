import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRole, isUserRole, hasEqualOrHigherRole } from '../types/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user exists and has a role
    if (!user || !user.role) {
      throw new ForbiddenException('User role not found');
    }

    // Validate that the user's role is a valid UserRole
    if (!isUserRole(user.role)) {
      throw new ForbiddenException('Invalid user role');
    }

    // Check if user has any of the required roles or higher
    const hasRequiredRole = requiredRoles.some(requiredRole =>
      hasEqualOrHigherRole(user.role as UserRole, requiredRole)
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `User role '${user.role}' does not have sufficient permissions`
      );
    }

    return true;
  }
}