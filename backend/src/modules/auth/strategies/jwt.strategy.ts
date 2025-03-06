import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../auth.module';
import config from '../../../config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.secret,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.usersService.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User account is disabled');
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}