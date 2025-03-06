import { Request } from 'express';
import { Document, SortOrder } from 'mongoose';

/**
 * Common filter options for database queries
 */
export interface FilterOptions {
  search?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  [key: string]: any;
}

/**
 * Common sort options for database queries
 */
export interface SortOptions {
  [key: string]: SortOrder;
}

/**
 * Common pagination options for database queries
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: SortOptions;
}

/**
 * Common paginated response interface
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Base response interface for API endpoints
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Base entity interface for MongoDB documents
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  deletedAt?: Date;
}

/**
 * Base document interface extending both Document and BaseEntity
 */
export interface BaseDocument extends Omit<Document, keyof BaseEntity>, BaseEntity {}

/**
 * Extended request interface with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    [key: string]: any;
  };
}

/**
 * Common validation error format
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  constraints?: Record<string, string>;
}

/**
 * Common query filters for lists
 */
export interface QueryFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  [key: string]: any;
}

/**
 * Entity timestamps
 */
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Audit information
 */
export interface AuditInfo {
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

/**
 * Generic service options
 */
export interface ServiceOptions {
  lean?: boolean;
  populate?: string | string[];
  select?: string | string[];
}

/**
 * Generic repository interface
 */
export interface Repository<T extends BaseDocument> {
  findById(id: string, options?: ServiceOptions): Promise<T | null>;
  findOne(filter: FilterOptions, options?: ServiceOptions): Promise<T | null>;
  find(filter?: FilterOptions, options?: ServiceOptions & PaginationOptions): Promise<PaginatedResponse<T>>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  softDelete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
  exists(filter: FilterOptions): Promise<boolean>;
  count(filter?: FilterOptions): Promise<number>;
}

/**
 * Cache options
 */
export interface CacheOptions {
  ttl?: number;
  key?: string;
  skipCache?: boolean;
}

/**
 * Event payload
 */
export interface EventPayload<T = any> {
  type: string;
  data: T;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

/**
 * Health check response
 */
export interface HealthCheck {
  status: 'ok' | 'error';
  version: string;
  timestamp: Date;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  services?: Record<string, {
    status: 'ok' | 'error';
    latency?: number;
    error?: string;
  }>;
}