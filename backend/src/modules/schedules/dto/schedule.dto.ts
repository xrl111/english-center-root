import { IsString, IsNotEmpty, IsDateString, IsNumber, Min, IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScheduleStatus } from '../../../schemas/schedule.schema';

export class CreateScheduleDto {
  @ApiProperty({ description: 'Course ID' })
  @IsNotEmpty()
  @IsMongoId()
  course: string;

  @ApiProperty({ description: 'Instructor ID' })
  @IsNotEmpty()
  @IsMongoId()
  instructor: string;

  @ApiProperty({ description: 'Schedule title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Start date and time' })
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @ApiProperty({ description: 'End date and time' })
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

  @ApiProperty({ description: 'Duration (e.g., "2 hours")' })
  @IsNotEmpty()
  @IsString()
  duration: string;

  @ApiProperty({ description: 'Location of the class' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiPropertyOptional({ description: 'Additional description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Maximum number of attendees' })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  maxAttendees: number;
}

export class UpdateScheduleDto {
  @ApiPropertyOptional({ description: 'Schedule title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Start date and time' })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date and time' })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Duration (e.g., "2 hours")' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ description: 'Location of the class' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Additional description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Maximum number of attendees' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  maxAttendees?: number;

  @ApiPropertyOptional({ enum: ScheduleStatus })
  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;
}

export class AttendeeDto {
  @ApiProperty({ description: 'User ID of the attendee' })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}

export class CancelScheduleDto {
  @ApiProperty({ description: 'Reason for cancellation' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class ScheduleQueryDto {
  @ApiPropertyOptional({ description: 'Course ID' })
  @IsOptional()
  @IsMongoId()
  course?: string;

  @ApiPropertyOptional({ description: 'Instructor ID' })
  @IsOptional()
  @IsMongoId()
  instructor?: string;

  @ApiPropertyOptional({ description: 'Schedule status', enum: ScheduleStatus })
  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;

  @ApiPropertyOptional({ description: 'Start date range (from)' })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date range (to)' })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Whether to include only active schedules' })
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}