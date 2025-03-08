export const PASSWORD_VALIDATION = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 32,
  PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
  MESSAGE:
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
} as const;

export const USERNAME_VALIDATION = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 30,
  PATTERN: /^[a-zA-Z0-9_-]+$/,
  MESSAGE:
    'Username can only contain letters, numbers, underscores, and hyphens',
} as const;
