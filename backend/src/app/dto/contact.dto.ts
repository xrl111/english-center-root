import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ContactDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Course Inquiry' })
  @IsNotEmpty()
  @IsString()
  subject!: string;

  @ApiProperty({ example: 'I would like to inquire about your courses...' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  message!: string;
}
