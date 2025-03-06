import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsBoolean,
  IsArray,
  IsDate,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../auth/types/roles';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    }
  )
  password!: string;

  @ApiProperty({ description: 'Username' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_-]*$/, {
    message: 'Username can only contain letters, numbers, underscores and hyphens',
  })
  username!: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  preferences?: Record<string, any>;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'New password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    }
  )
  newPassword!: string;
}

export class UserQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAfter?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdBefore?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class UserPreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customSettings?: Record<string, any>;
}

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiProperty()
  isEmailVerified!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ type: [String] })
  permissions?: string[];

  @ApiPropertyOptional()
  preferences?: UserPreferencesDto;
}