import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../types/roles';
import { PASSWORD_VALIDATION, USERNAME_VALIDATION } from '../auth.module';

export class RegisterDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @MinLength(PASSWORD_VALIDATION.MIN_LENGTH)
  @MaxLength(PASSWORD_VALIDATION.MAX_LENGTH)
  @Matches(PASSWORD_VALIDATION.PATTERN, {
    message: PASSWORD_VALIDATION.MESSAGE,
  })
  password: string;

  @ApiProperty({ description: 'Username' })
  @IsString()
  @MinLength(USERNAME_VALIDATION.MIN_LENGTH)
  @MaxLength(USERNAME_VALIDATION.MAX_LENGTH)
  @Matches(USERNAME_VALIDATION.PATTERN, {
    message: USERNAME_VALIDATION.MESSAGE,
  })
  username: string;

  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class LoginDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  @MinLength(PASSWORD_VALIDATION.MIN_LENGTH)
  @MaxLength(PASSWORD_VALIDATION.MAX_LENGTH)
  @Matches(PASSWORD_VALIDATION.PATTERN, {
    message: PASSWORD_VALIDATION.MESSAGE,
  })
  newPassword: string;
}

export class RequestPasswordResetDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  @MinLength(PASSWORD_VALIDATION.MIN_LENGTH)
  @MaxLength(PASSWORD_VALIDATION.MAX_LENGTH)
  @Matches(PASSWORD_VALIDATION.PATTERN, {
    message: PASSWORD_VALIDATION.MESSAGE,
  })
  newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({ description: 'Email verification token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class LogoutDto {
  @ApiProperty({ description: 'Refresh token to invalidate' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class TokenResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;
}

export class MessageResponse {
  @ApiProperty()
  message: string;
}

export class ProfileResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  lastLogin?: Date;
}