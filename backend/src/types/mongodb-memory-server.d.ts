declare module 'mongodb-memory-server' {
  export class MongoMemoryServer {
    static create(opts?: MongoMemoryServerOpts): Promise<MongoMemoryServer>;
    start(): Promise<void>;
    stop(): Promise<void>;
    getUri(): string;
    cleanup(): Promise<void>;
  }

  interface MongoMemoryServerOpts {
    instance?: {
      port?: number;
      ip?: string;
      dbPath?: string;
      dbName?: string;
      storageEngine?: string;
    };
    binary?: {
      version?: string;
      downloadDir?: string;
      platform?: string;
      arch?: string;
      debug?: boolean;
    };
    autoStart?: boolean;
  }

  export class MongoMemoryReplSet {
    static create(opts?: MongoMemoryReplSetOpts): Promise<MongoMemoryReplSet>;
    start(): Promise<void>;
    stop(): Promise<void>;
    getUri(): string;
    cleanup(): Promise<void>;
  }

  interface MongoMemoryReplSetOpts extends MongoMemoryServerOpts {
    replSet?: {
      name?: string;
      count?: number;
      storageEngine?: string;
    };
  }
}

declare module 'mongodb-memory-server-core' {
  export * from 'mongodb-memory-server';
}

declare module 'mongodb-memory-server-global' {
  export * from 'mongodb-memory-server';
}