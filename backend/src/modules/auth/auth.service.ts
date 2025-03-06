import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/user.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { AppLogger } from '../../services/logger.service';
import { AUTH_ERRORS, AUTH_MESSAGES, AuthTokens, JwtPayload, RefreshTokenPayload } from './auth.module';
import { UserRole } from './types/roles';
import * as crypto from 'crypto';
import { FilterQuery } from 'mongoose';

// Import Profile Response type
export interface ProfileResponse {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isEmailVerified: boolean;
  lastLogin?: Date;
}

interface JwtConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private logger: AppLogger,
    @Inject('JWT_CONFIG') private jwtConfig: JwtConfig,
  ) {
    this.logger.setContext('AuthService');
  }

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(AUTH_ERRORS.ACCOUNT_DISABLED);
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(AUTH_ERRORS.EMAIL_NOT_VERIFIED);
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    return user;
  }

  async login(user: UserDocument): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    // Update refresh tokens array
    user.refreshTokens = [refreshToken, ...user.refreshTokens.slice(0, 4)];
    await user.save();

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getExpiresInSeconds(this.jwtConfig.expiresIn),
    };
  }

  async register(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Set default role as USER if not specified
    const userToCreate = {
      ...createUserDto,
      role: createUserDto.role || UserRole.USER,
    };

    const user = await this.usersService.create(userToCreate);
    await this.generateEmailVerification(user);
    return user;
  }

  async getUserProfile(userId: string): Promise<ProfileResponse> {
    const user = await this.usersService.findById(userId);
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.refreshTokens.includes(refreshToken)) {
        throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
      }

      // Remove the used refresh token and update with new one
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      await user.save();

      // Generate new tokens
      return this.login(user);
    } catch (error) {
      this.logger.error('Error refreshing token', error.stack);
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      await user.save();
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const users = await this.usersService.findByFilter({ emailVerificationToken: token });
      const user = users[0];
      
      if (!user) {
        throw new BadRequestException(AUTH_ERRORS.INVALID_TOKEN);
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();
    } catch (error) {
      this.logger.error('Error verifying email', error.stack);
      throw new BadRequestException(AUTH_ERRORS.INVALID_TOKEN);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal whether a user exists
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // TODO: Send password reset email
    this.logger.debug(`Password reset token for ${email}: ${token}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const users = await this.usersService.findByFilter({ 
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });
    const user = users[0];

    if (!user) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_TOKEN);
    }

    await user.setPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.secret,
      expiresIn: this.jwtConfig.expiresIn,
    });
  }

  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
    const refreshPayload: RefreshTokenPayload = {
      ...payload,
      tokenVersion: Date.now(),
    };

    return this.jwtService.signAsync(refreshPayload, {
      secret: this.jwtConfig.refreshSecret,
      expiresIn: this.jwtConfig.refreshExpiresIn,
    });
  }

  private async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfig.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }
  }

  private getExpiresInSeconds(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 3600; // Default to 1 hour
    }

    const [, value, unit] = match;
    const multipliers = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return parseInt(value, 10) * multipliers[unit as keyof typeof multipliers];
  }

  private async generateEmailVerification(user: UserDocument): Promise<void> {
    const token = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = token;
    await user.save();

    // TODO: Send verification email
    this.logger.debug(`Verification token for ${user.email}: ${token}`);
  }
}