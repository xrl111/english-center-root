export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
  GUEST = 'guest',
}

// Type guard to check if a string is a valid UserRole
export function isUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

// Helper function to get all available roles
export function getAllRoles(): UserRole[] {
  return Object.values(UserRole);
}

// Helper to check if one role has higher privileges than another
export const roleHierarchy: Record<UserRole, number> = {
  [UserRole.ADMIN]: 100,
  [UserRole.INSTRUCTOR]: 75,
  [UserRole.USER]: 50,
  [UserRole.STUDENT]: 25,
  [UserRole.GUEST]: 0,
};

export function hasHigherRole(role1: UserRole, role2: UserRole): boolean {
  return roleHierarchy[role1] > roleHierarchy[role2];
}

export function hasEqualOrHigherRole(role1: UserRole, role2: UserRole): boolean {
  return roleHierarchy[role1] >= roleHierarchy[role2];
}
