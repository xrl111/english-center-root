import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface JwtError extends Error {
  name: 'JsonWebTokenError' | 'TokenExpiredError' | string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
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
      });

      // Attach user to request
      request.user = payload;
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

// Types for request augmentation
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        [key: string]: any;
      };
    }
  }
}