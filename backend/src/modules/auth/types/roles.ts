export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
  USER = 'user',
}

export interface RolePermissions {
  [key: string]: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    manage: boolean;
  };
}

export const ROLE_PERMISSIONS: { [key in UserRole]: RolePermissions } = {
  [UserRole.ADMIN]: {
    users: {
      create: true,
      read: true,
      update: true,
      delete: true,
      manage: true,
    },
    courses: {
      create: true,
      read: true,
      update: true,
      delete: true,
      manage: true,
    },
    news: {
      create: true,
      read: true,
      update: true,
      delete: true,
      manage: true,
    },
    schedules: {
      create: true,
      read: true,
      update: true,
      delete: true,
      manage: true,
    },
    settings: {
      create: true,
      read: true,
      update: true,
      delete: true,
      manage: true,
    },
  },
  [UserRole.INSTRUCTOR]: {
    users: {
      create: false,
      read: true,
      update: false,
      delete: false,
      manage: false,
    },
    courses: {
      create: true,
      read: true,
      update: true,
      delete: false,
      manage: true,
    },
    news: {
      create: true,
      read: true,
      update: true,
      delete: true,
      manage: false,
    },
    schedules: {
      create: true,
      read: true,
      update: true,
      delete: true,
      manage: true,
    },
    settings: {
      create: false,
      read: true,
      update: false,
      delete: false,
      manage: false,
    },
  },
  [UserRole.STUDENT]: {
    users: {
      create: false,
      read: false,
      update: false,
      delete: false,
      manage: false,
    },
    courses: {
      create: false,
      read: true,
      update: false,
      delete: false,
      manage: false,
    },
    news: {
      create: false,
      read: true,
      update: false,
      delete: false,
      manage: false,
    },
    schedules: {
      create: false,
      read: true,
      update: false,
      delete: false,
      manage: false,
    },
    settings: {
      create: false,
      read: false,
      update: false,
      delete: false,
      manage: false,
    },
  },
  [UserRole.USER]: {
    users: {
      create: false,
      read: false,
      update: false,
      delete: false,
      manage: false,
    },
    courses: {
      create: false,
      read: true,
      update: false,
      delete: false,
      manage: false,
    },
    news: {
      create: false,
      read: true,
      update: false,
      delete: false,
      manage: false,
    },
    schedules: {
      create: false,
      read: false,
      update: false,
      delete: false,
      manage: false,
    },
    settings: {
      create: false,
      read: false,
      update: false,
      delete: false,
      manage: false,
    },
  },
};

export interface PermissionCheck {
  resource: string;
  action: keyof RolePermissions[string];
}

export function hasPermission(role: UserRole, check: PermissionCheck): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  const resourcePermissions = permissions[check.resource];
  if (!resourcePermissions) return false;

  return resourcePermissions[check.action] || false;
}

export function getRoleHierarchy(role: UserRole): UserRole[] {
  switch (role) {
    case UserRole.ADMIN:
      return [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT, UserRole.USER];
    case UserRole.INSTRUCTOR:
      return [UserRole.INSTRUCTOR, UserRole.STUDENT, UserRole.USER];
    case UserRole.STUDENT:
      return [UserRole.STUDENT, UserRole.USER];
    case UserRole.USER:
      return [UserRole.USER];
    default:
      return [];
  }
}

export function isRoleAtLeast(userRole: UserRole, requiredRole: UserRole): boolean {
  const hierarchy = getRoleHierarchy(userRole);
  return hierarchy.includes(requiredRole);
}

export const ROLE_DESCRIPTIONS: { [key in UserRole]: string } = {
  [UserRole.ADMIN]: 'Full system access with all permissions',
  [UserRole.INSTRUCTOR]: 'Can manage courses and related content',
  [UserRole.STUDENT]: 'Can access and participate in courses',
  [UserRole.USER]: 'Basic access to public content',
};