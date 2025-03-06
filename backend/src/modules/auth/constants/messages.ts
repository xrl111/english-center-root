export const AUTH_MESSAGES = {
  // Success messages
  SUCCESS: {
    LOGIN: 'Successfully logged in',
    LOGOUT: 'Successfully logged out',
    REGISTER: 'Successfully registered. Please check your email for verification',
    EMAIL_VERIFIED: 'Email successfully verified',
    PASSWORD_RESET_SENT: 'Password reset instructions have been sent to your email',
    PASSWORD_RESET: 'Password has been successfully reset',
    PASSWORD_CHANGE: 'Password has been successfully changed',
    PROFILE_UPDATE: 'Profile has been successfully updated',
    TOKEN_REFRESH: 'Token successfully refreshed',
    SOCIAL_LOGIN: 'Successfully logged in with social provider',
    ACCOUNT_ACTIVATE: 'Account has been successfully activated',
    ACCOUNT_DEACTIVATE: 'Account has been successfully deactivated',
  },

  // Error messages
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
    ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support',
    TOKEN_EXPIRED: 'Authentication token has expired',
    TOKEN_INVALID: 'Invalid authentication token',
    REFRESH_TOKEN_EXPIRED: 'Refresh token has expired',
    REFRESH_TOKEN_INVALID: 'Invalid refresh token',
    PASSWORD_MISMATCH: 'Current password is incorrect',
    EMAIL_EXISTS: 'Email address is already registered',
    USERNAME_EXISTS: 'Username is already taken',
    RESET_TOKEN_INVALID: 'Password reset token is invalid or has expired',
    VERIFICATION_TOKEN_INVALID: 'Email verification token is invalid or has expired',
    SOCIAL_AUTH_FAILED: 'Social authentication failed',
    INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
    INVALID_ROLE: 'Invalid role specified',
    ACCOUNT_LOCKED: 'Account is locked due to too many failed attempts',
  },

  // Information messages
  INFO: {
    PASSWORD_REQUIREMENTS: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character',
    EMAIL_VERIFICATION_REQUIRED: 'Please verify your email address to access all features',
    VERIFICATION_EMAIL_SENT: 'Verification email has been sent',
    PASSWORD_RESET_EMAIL_SENT: 'Password reset email has been sent',
    SESSION_EXPIRED: 'Your session has expired. Please log in again',
    ACCOUNT_PENDING: 'Your account is pending approval',
    SOCIAL_AUTH_LINKING: 'Social account linking in progress',
  },

  // Warning messages
  WARNING: {
    PASSWORD_EXPIRING: 'Your password will expire soon. Please change it',
    ACCOUNT_INACTIVE: 'Your account has been inactive for a long time',
    LOGIN_ATTEMPTS: 'Multiple failed login attempts detected',
    UNUSUAL_ACTIVITY: 'Unusual account activity detected',
    WEAK_PASSWORD: 'The password you chose is weak. Consider using a stronger password',
    INCOMPLETE_PROFILE: 'Please complete your profile information',
  },
};

export const EMAIL_TEMPLATES = {
  VERIFICATION: {
    SUBJECT: 'Verify Your Email Address',
    GREETING: 'Welcome to our platform!',
    BODY: 'Please click the link below to verify your email address:',
    BUTTON: 'Verify Email',
    EXPIRY: 'This link will expire in 24 hours.',
  },

  PASSWORD_RESET: {
    SUBJECT: 'Reset Your Password',
    GREETING: 'Password Reset Requested',
    BODY: 'You have requested to reset your password. Click the link below to proceed:',
    BUTTON: 'Reset Password',
    EXPIRY: 'This link will expire in 1 hour.',
  },

  WELCOME: {
    SUBJECT: 'Welcome to Our Platform',
    GREETING: 'Welcome aboard!',
    BODY: 'Thank you for joining our platform. We are excited to have you as a member.',
    NEXT_STEPS: 'Here are some next steps to get started:',
  },

  ACCOUNT_CHANGE: {
    SUBJECT: 'Account Changes Notification',
    GREETING: 'Hello,',
    BODY: 'Changes have been made to your account. If you did not make these changes, please contact us immediately.',
  },
};

export const VALIDATION_MESSAGES = {
  EMAIL: {
    REQUIRED: 'Email address is required',
    INVALID: 'Invalid email address format',
  },

  PASSWORD: {
    REQUIRED: 'Password is required',
    MIN_LENGTH: 'Password must be at least 8 characters long',
    PATTERN: 'Password must contain uppercase, lowercase, number and special character',
  },

  USERNAME: {
    REQUIRED: 'Username is required',
    MIN_LENGTH: 'Username must be at least 3 characters long',
    PATTERN: 'Username can only contain letters, numbers, underscores, and hyphens',
  },

  ROLE: {
    REQUIRED: 'Role is required',
    INVALID: 'Invalid role specified',
  },
};

export const HTTP_STATUS_MESSAGES = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
};