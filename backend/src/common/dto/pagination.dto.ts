import { IsNumber, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10) || 1)
  private readonly page: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10) || 10)
  private readonly limit: number = 10;

  getPage(): number {
    return this.page;
  }

  getLimit(): number {
    return this.limit;
  }

  getOffset(): number {
    return (this.page - 1) * this.limit;
  }

  static create(page?: number, limit?: number): PaginationDto {
    const dto = new PaginationDto();
    Object.assign(dto, {
      page: Math.max(1, page || 1),
      limit: Math.max(1, Math.min(limit || 10, 100)), // Max 100 items per page
    });
    return dto;
  }
}

export interface PaginationMeta {
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export function createPaginatedResponse<T>(
  items: T[],
  totalItems: number,
  pagination: PaginationDto
): PaginatedResult<T> {
  const itemsPerPage = pagination.getLimit();
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return {
    items,
    meta: {
      totalItems,
      itemsPerPage,
      totalPages,
      currentPage: pagination.getPage(),
    },
  };
}

// Helper function to validate and normalize pagination parameters
export function normalizePagination(page?: number | string, limit?: number | string): PaginationDto {
  const normalizedPage = Number(page) || 1;
  const normalizedLimit = Number(limit) || 10;
  return PaginationDto.create(normalizedPage, normalizedLimit);
}

// Helper type for paginated query options
export interface PaginatedQueryOptions {
  pagination: PaginationDto;
  [key: string]: any;
}

// Helper function to create query options with pagination
export function createPaginatedQueryOptions(
  pagination: PaginationDto,
  additionalOptions: Record<string, any> = {}
): PaginatedQueryOptions {
  return {
    pagination,
    ...additionalOptions,
  };
}