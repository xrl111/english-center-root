import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../types/roles';
import { UserPayload } from '../types/common';

interface JwtPayload extends UserPayload {
  id: string;
  email: string;
  role: UserRole;
}

interface JwtError extends Error {
  name: 'JsonWebTokenError' | 'TokenExpiredError' | string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header found');
    }

    try {
      const [type, token] = authHeader.split(' ');

      if (type !== 'Bearer') {
        throw new UnauthorizedException('Invalid authorization type');
      }

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }) as JwtPayload;

      // Attach user payload to request
      request.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      };
      return true;
    } catch (error) {
      const jwtError = error as JwtError;

      if (jwtError.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      if (jwtError.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Invalid authorization');
    }
  }
}
