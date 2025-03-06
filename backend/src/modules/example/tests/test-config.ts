import { Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export const TEST_CONFIG = {
  mongodb: {
    uri: 'mongodb://localhost/test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: 'test-jwt-secret',
    expiresIn: '1h',
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
};

export type ConfigType = {
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  [key: string]: any;
};

export class TestConfigService extends ConfigService<ConfigType> {
  private readonly testConfig: ConfigType;

  constructor() {
    super();
    this.testConfig = {
      MONGODB_URI: TEST_CONFIG.mongodb.uri,
      JWT_SECRET: TEST_CONFIG.jwt.secret,
      JWT_EXPIRES_IN: TEST_CONFIG.jwt.expiresIn,
    };
  }

  get<T = any>(propertyPath: keyof ConfigType): T {
    return this.testConfig[propertyPath] as T;
  }
}

export const mockConfigService = new TestConfigService();

export interface MockModel<T = any> {
  new (): T;
  find: jest.Mock;
  findOne: jest.Mock;
  findById: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  exec: jest.Mock;
  countDocuments: jest.Mock;
  skip: jest.Mock;
  limit: jest.Mock;
  sort: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
}

export function createMockModel(): MockModel {
  return {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    create: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
    countDocuments: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
  } as unknown as MockModel;
}

export function createMockId(): Types.ObjectId {
  return new Types.ObjectId();
}

export function createMockDate(overrideDate?: Date): Date {
  return overrideDate || new Date('2025-01-01T00:00:00.000Z');
}

export function createTestPagination(override: Partial<PaginationDto> = {}): PaginationDto {
  const pagination = new PaginationDto();
  Object.assign(pagination, {
    page: 1,
    limit: TEST_CONFIG.pagination.defaultLimit,
    ...override,
  });
  return pagination;
}

export interface TestError extends Error {
  code?: number;
  status?: number;
}

export function createTestError(message: string, code?: number): TestError {
  const error: TestError = new Error(message);
  if (code) {
    error.code = code;
    error.status = code;
  }
  return error;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Add custom matchers for jest
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  toBeMongoId(received: string) {
    const pass = Types.ObjectId.isValid(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid MongoDB ObjectId`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid MongoDB ObjectId`,
        pass: false,
      };
    }
  },
});

// Add types for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
      toBeMongoId(): R;
    }
  }
}