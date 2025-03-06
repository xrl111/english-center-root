import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { User } from '../../users/schemas/user.schema';
import { RequestWithUser } from '../types/common';

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, context: ExecutionContext): User | Partial<User> => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (data) {
      const value = user[data];
      if (value === undefined) {
        throw new UnauthorizedException(`User property ${String(data)} not found`);
      }
      return { [data]: value } as Partial<User>;
    }

    return user;
  }
);

/**
 * Get specific user property from the current user
 * @example
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUserProperty('email') email: string) {
 *   return { email };
 * }
 * ```
 */
export const CurrentUserProperty = (property: keyof User) =>
  createParamDecorator((_, context: ExecutionContext): any => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const value = user[property];
    if (value === undefined) {
      throw new UnauthorizedException(`User property ${String(property)} not found`);
    }

    return value;
  })();