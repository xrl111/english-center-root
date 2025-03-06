import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { TEST_CONFIG } from './test-config';

let mongod: MongoMemoryServer;

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = TEST_CONFIG.jwt.secret;
process.env.JWT_EXPIRES_IN = TEST_CONFIG.jwt.expiresIn;

// Configure Jest timeout
jest.setTimeout(30000);

// Connect to in-memory database before tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// Clear database between tests
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

// Disconnect and cleanup after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  global.console.log = jest.fn();
  global.console.error = jest.fn();
  global.console.warn = jest.fn();
  global.console.info = jest.fn();
});

afterAll(() => {
  global.console = originalConsole;
});

// Add custom environment variables for testing
process.env.TEST_MODE = 'true';
process.env.MONGODB_URI = 'mongodb://localhost/test';

// Add global test utilities
global.sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Configure timezone for consistent date handling
process.env.TZ = 'UTC';

// Add custom matchers
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
});

// Mock Date
const mockDate = new Date('2025-01-01T00:00:00.000Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

// Utility type for mocked dates
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
  function sleep(ms: number): Promise<void>;
}

// Export common test utilities
export const testUtils = {
  createObjectId: () => new mongoose.Types.ObjectId(),
  mockDate,
  sleep: global.sleep,
};