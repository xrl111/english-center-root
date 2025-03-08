import { UserPayload } from '../../modules/auth/types/common';

declare global {
  namespace Express {
    // Tell TypeScript that our User type is compatible with Passport's User
    interface User extends UserPayload {}
  }
}

// This file is a module
export {};
