import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user.dto';

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  items!: T[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  pages!: number;
}

export class PaginatedUsersResponseDto extends PaginatedResponseDto<UserResponseDto> {
  @ApiProperty({ type: [UserResponseDto] })
  items!: UserResponseDto[];
}