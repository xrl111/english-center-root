import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/user.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { AppLogger, LogMetadata } from '../../services/logger.service';
import {
  AUTH_ERRORS,
  AUTH_MESSAGES,
  AuthTokens,
  JwtPayload,
  RefreshTokenPayload,
} from './auth.module';
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
  lastLogin?: Date;
}

interface JwtConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

function formatError(error: unknown): LogMetadata {
  if (error instanceof Error) {
    return {
      error: error.message,
      stack: error.stack,
    };
  }
  return { error: String(error) };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private logger: AppLogger,
    @Inject('JWT_CONFIG') private jwtConfig: JwtConfig,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {
    this.logger.setContext('AuthService');
  }

  async validateUser(email: string, password: string): Promise<UserDocument> {
    try {
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

      // Update last login time
      user.lastLogin = new Date();
      await user.save();

      return user;
    } catch (error) {
      this.logger.error('Error validating user', formatError(error));
      throw error;
    }
  }

  async login(user: UserDocument): Promise<AuthTokens> {
    try {
      const payload: JwtPayload = {
        sub: user._id.toString(),
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
    } catch (error) {
      this.logger.error('Error during login', formatError(error));
      throw error;
    }
  }

  async register(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      // Set default role as USER if not specified and ensure account is active
      const userToCreate = {
        ...createUserDto,
        role: createUserDto.role || UserRole.USER,
        isActive: true,
        lastLogin: new Date(),
      };

      // Check for existing user with same email or username
      const existingUser = await this.userModel.findOne({
        $or: [
          { email: userToCreate.email.toLowerCase() },
          { username: userToCreate.username },
        ],
      });

      if (existingUser) {
        const field =
          existingUser.email === userToCreate.email.toLowerCase()
            ? 'email'
            : 'username';
        throw new BadRequestException(`User with this ${field} already exists`);
      }

      // Create new user document
      const user = new this.userModel(userToCreate);
      await user.save();

      // Return user with tokens
      return this.login(user).then(() => user);
    } catch (error: any) {
      // Enhanced error logging
      console.error('Registration error details:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name,
        code: error?.code,
      });

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error?.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new BadRequestException(`User with this ${field} already exists`);
      }

      throw error;
    }
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
      lastLogin: user.lastLogin,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      const user = await this.usersService.findByEmail(payload.email);

      if (!user || !user.refreshTokens.includes(refreshToken)) {
        throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
      }

      // Remove the used refresh token and update with new one
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken
      );
      await user.save();

      // Generate new tokens
      return this.login(user);
    } catch (error) {
      this.logger.error('Error refreshing token', formatError(error));
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    try {
      const user = await this.usersService.findByEmail(userId);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (token) => token !== refreshToken
        );
        await user.save();
      }
    } catch (error) {
      this.logger.error('Error during logout', formatError(error));
      // We don't throw here as logout should be "best effort"
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
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
    } catch (error) {
      this.logger.error('Error requesting password reset', formatError(error));
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userModel.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new BadRequestException(AUTH_ERRORS.INVALID_TOKEN);
      }

      await user.setPassword(newPassword);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
    } catch (error) {
      this.logger.error('Error resetting password', formatError(error));
      throw new BadRequestException(AUTH_ERRORS.INVALID_TOKEN);
    }
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

  private async verifyRefreshToken(
    token: string
  ): Promise<RefreshTokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfig.refreshSecret,
      });
    } catch (error) {
      this.logger.error('Error verifying refresh token', formatError(error));
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
}
