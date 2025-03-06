import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../types/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route or controller
 * @param roles One or more roles required to access the route
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Helper type to extract roles from a controller or route handler
 */
export type RolesMetadata = UserRole[];

/**
 * Helper function to check if the metadata contains specific roles
 */
export function hasRoles(metadata: RolesMetadata, ...roles: UserRole[]): boolean {
  if (!metadata) {
    return false;
  }
  return roles.some(role => metadata.includes(role));
}

/**
 * Helper function to check if the metadata requires admin role
 */
export function requiresAdmin(metadata: RolesMetadata): boolean {
  return hasRoles(metadata, UserRole.ADMIN);
}

/**
 * Helper function to check if the metadata requires instructor role
 */
export function requiresInstructor(metadata: RolesMetadata): boolean {
  return hasRoles(metadata, UserRole.INSTRUCTOR);
}

/**
 * Helper function to get the highest required role from metadata
 */
export function getHighestRequiredRole(metadata: RolesMetadata): UserRole | null {
  if (!metadata || metadata.length === 0) {
    return null;
  }

  return metadata.reduce((highest, current) => {
    if (!highest) {
      return current;
    }
    return roleHierarchy[current] > roleHierarchy[highest] ? current : highest;
  }, null as UserRole | null);
}

// Role hierarchy mapping (higher number = higher privileges)
const roleHierarchy: Record<UserRole, number> = {
  [UserRole.ADMIN]: 100,
  [UserRole.INSTRUCTOR]: 75,
  [UserRole.USER]: 50,
  [UserRole.STUDENT]: 25,
  [UserRole.GUEST]: 0,
};