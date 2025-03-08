import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Connection,
  createConnection,
  ConnectOptions,
  Model,
  FilterQuery,
  UpdateQuery,
  HydratedDocument,
} from 'mongoose';
import { AppLogger, LogMetadata } from './logger.service';
import { BasePopulateOptions, BaseSortOptions } from '../schemas/base.schema';
import { DatabaseMethods } from './database-methods';
import { BaseModelFields } from '../interfaces/base-model.interface';

interface ErrorMetadata extends LogMetadata {
  error: string;
  stack?: string;
}

function formatError(error: unknown): ErrorMetadata {
  if (error instanceof Error) {
    return {
      error: error.message,
      stack: error.stack,
    };
  }
  return { error: String(error) };
}

@Injectable()
export class DatabaseService
  implements OnModuleInit, OnModuleDestroy, DatabaseMethods
{
  private connection!: Connection;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectInterval = 5000; // 5 seconds

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext('DatabaseService');
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  async findOne<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>,
    options: {
      populate?: BasePopulateOptions[];
      select?: string;
      lean?: boolean;
    } = {}
  ): Promise<HydratedDocument<T> | null> {
    let query = model.findOne(filter) as any;
    if (options.populate) {
      query = query.populate(options.populate);
    }
    if (options.select) {
      query = query.select(options.select);
    }
    if (options.lean) {
      query = query.lean();
    }
    return query.exec();
  }

  async find<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>,
    options: {
      populate?: BasePopulateOptions[];
      select?: string;
      sort?: BaseSortOptions;
      limit?: number;
      skip?: number;
      lean?: boolean;
    } = {}
  ): Promise<HydratedDocument<T>[]> {
    let query = model.find(filter) as any;
    if (options.populate) {
      query = query.populate(options.populate);
    }
    if (options.select) {
      query = query.select(options.select);
    }
    if (options.sort) {
      query = query.sort(options.sort);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.skip) {
      query = query.skip(options.skip);
    }
    if (options.lean) {
      query = query.lean();
    }
    return query.exec();
  }

  async create<T extends BaseModelFields>(
    model: Model<T>,
    data: Partial<T>,
    options: { userId?: string } = {}
  ): Promise<HydratedDocument<T>> {
    if (options.userId) {
      (data as any).createdBy = options.userId;
    }
    const doc = new model(data);
    return doc.save();
  }

  async update<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options: {
      userId?: string;
      new?: boolean;
      runValidators?: boolean;
      populate?: BasePopulateOptions[];
    } = {}
  ): Promise<HydratedDocument<T> | null> {
    if (options.userId) {
      if (!update.$set) update.$set = {};
      (update.$set as any).updatedBy = options.userId;
    }
    let query = model.findOneAndUpdate(filter, update, {
      new: options.new ?? true,
      runValidators: options.runValidators ?? true,
    }) as any;
    if (options.populate) {
      query = query.populate(options.populate);
    }
    return query.exec();
  }

  async delete<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>,
    options: { permanent?: boolean; userId?: string } = {}
  ): Promise<boolean> {
    if (options.permanent) {
      const result = await model.deleteOne(filter).exec();
      return result.deletedCount > 0;
    }
    const result = await model.updateOne(filter, {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
        ...(options.userId && { updatedBy: options.userId }),
      },
    });
    return result.modifiedCount > 0;
  }

  async restore<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>,
    options: { userId?: string } = {}
  ): Promise<boolean> {
    const update: UpdateQuery<T> = {
      $set: {
        isDeleted: false,
        deletedAt: undefined,
        ...(options.userId && { updatedBy: options.userId }),
      },
      $unset: { deletedAt: 1 },
    };
    const result = await model.updateOne(filter, update).exec();
    return result.modifiedCount > 0;
  }

  async count<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T> = {}
  ): Promise<number> {
    return model.countDocuments(filter).exec();
  }

  async exists<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>
  ): Promise<boolean> {
    const count = await model.countDocuments(filter).limit(1).exec();
    return count > 0;
  }

  async connect(): Promise<void> {
    try {
      if (this.isConnected) {
        this.logger.debug('Database is already connected');
        return;
      }

      const uri = this.configService.get<string>('MONGODB_URI');
      if (!uri) {
        throw new Error('MongoDB URI is not configured');
      }

      const options: ConnectOptions = {
        autoCreate: true,
        autoIndex: true,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        keepAlive: true,
        maxPoolSize: 10,
        minPoolSize: 2,
      };

      this.connection = await createConnection(uri, options);

      this.connection.on('connected', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.logger.log('Successfully connected to MongoDB');
      });

      this.connection.on('disconnected', () => {
        this.isConnected = false;
        this.logger.warn('Disconnected from MongoDB');
        this.handleDisconnect();
      });

      this.connection.on('error', (error) => {
        this.logger.error('MongoDB connection error', error);
        if (this.isConnected) {
          this.handleDisconnect();
        }
      });

      await this.connection.asPromise();
      this.isConnected = true;
      this.logger.log('Successfully connected to MongoDB');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB', formatError(error));
      this.handleDisconnect();
      throw error;
    }
  }

  private async handleDisconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(
        `Failed to reconnect after ${this.maxReconnectAttempts} attempts`
      );
      return;
    }

    this.reconnectAttempts++;
    this.logger.warn(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        this.logger.error('Reconnection attempt failed', formatError(error));
      }
    }, this.reconnectInterval);
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.close();
        this.isConnected = false;
        this.logger.log('Disconnected from MongoDB');
      } catch (error) {
        this.logger.error(
          'Error while disconnecting from MongoDB',
          formatError(error)
        );
        throw error;
      }
    }
  }

  getConnection(): Connection {
    if (!this.isConnected) {
      throw new Error('Database is not connected');
    }
    return this.connection;
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      if (!this.isConnected) {
        return {
          status: 'disconnected',
          details: {
            error: 'Database is not connected',
            reconnectAttempts: this.reconnectAttempts,
          },
        };
      }

      const ping = await this.connection.db.admin().ping();
      return {
        status: 'connected',
        details: {
          ping,
          connectionState: this.connection.readyState,
          models: Object.keys(this.connection.models),
        },
      };
    } catch (error) {
      this.logger.error('Database health check failed', formatError(error));
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        status: 'error',
        details: {
          error: errorMessage,
          connectionState: this.connection?.readyState,
        },
      };
    }
  }

  async getStats(): Promise<{
    status: string;
    collections: number;
    documents: number;
    dataSize: number;
    storageSize: number;
    indexes: number;
    indexSize: number;
  }> {
    try {
      if (!this.isConnected) {
        throw new Error('Database is not connected');
      }

      const stats = await this.connection.db.stats();
      return {
        status: 'connected',
        collections: stats.collections,
        documents: stats.objects,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
      };
    } catch (error) {
      this.logger.error('Failed to get database stats', formatError(error));
      throw error;
    }
  }

  async dropDatabase(): Promise<void> {
    if (this.configService.get('NODE_ENV') === 'production') {
      throw new Error('Cannot drop database in production environment');
    }

    try {
      await this.connection.db.dropDatabase();
      this.logger.warn('Database dropped successfully');
    } catch (error) {
      const metadata: LogMetadata =
        error instanceof Error
          ? { error: error.message, stack: error.stack }
          : { error: String(error) };
      this.logger.error('Failed to drop database', metadata);
      throw error;
    }
  }

  isConnectedToDatabase(): boolean {
    return this.isConnected;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}
