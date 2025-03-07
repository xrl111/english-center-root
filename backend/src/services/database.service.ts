import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, createConnection, Model, FilterQuery, UpdateQuery, HydratedDocument } from 'mongoose';
import { AppLogger } from './logger.service';
import { BasePopulateOptions, BaseSortOptions } from '../schemas/base.schema';
import { DatabaseMethods } from './database-methods';
import { BaseModelFields } from '../interfaces/base-model.interface';

@Injectable()
export class DatabaseService implements DatabaseMethods, OnModuleInit, OnModuleDestroy {
  private connection!: Connection;
  private isConnected = false;
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

  private async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    const uri = this.configService.get<string>('MONGODB_URI');
    if (!uri) {
      throw new Error('MongoDB URI is not configured');
    }

    try {
      this.connection = await createConnection(uri);
      this.isConnected = true;
      this.logger.log('Connected to MongoDB');
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to connect to MongoDB', { error: errorMsg });
      throw error;
    }
  }

  private async disconnect(): Promise<void> {
    if (!this.connection) {
      return;
    }

    try {
      await this.connection.close();
      this.isConnected = false;
      this.logger.log('Disconnected from MongoDB');
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error('Error disconnecting from MongoDB', { error: errorMsg });
      throw error;
    }
  }

  public async findOne<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>,
    options?: {
      populate?: BasePopulateOptions[];
      select?: string;
      lean?: boolean;
    }
  ): Promise<HydratedDocument<T> | null> {
    try {
      const query = model.findOne(filter);
      const opts = options || {};

      if (opts.populate) {
        query.populate(opts.populate);
      }
      if (opts.select) {
        query.select(opts.select);
      }
      if (opts.lean) {
        query.lean<HydratedDocument<T>>();
      }

      return query.exec();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error('Error in findOne operation', { error: errorMsg });
      throw error;
    }
  }

  public async find<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>,
    options?: {
      populate?: BasePopulateOptions[];
      select?: string;
      sort?: BaseSortOptions;
      limit?: number;
      skip?: number;
      lean?: boolean;
    }
  ): Promise<HydratedDocument<T>[]> {
    try {
      const query = model.find(filter);
      const opts = options || {};

      if (opts.populate) {
        query.populate(opts.populate);
      }
      if (opts.select) {
        query.select(opts.select);
      }
      if (opts.sort) {
        query.sort(opts.sort);
      }
      if (opts.limit) {
        query.limit(opts.limit);
      }
      if (opts.skip) {
        query.skip(opts.skip);
      }
      if (opts.lean) {
        query.lean<HydratedDocument<T>>();
      }

      return query.exec();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error('Error in find operation', { error: errorMsg });
      throw error;
    }
  }

  public async create<T extends BaseModelFields>(
    model: Model<T>,
    data: Partial<T>,
    options?: { userId?: string }
  ): Promise<HydratedDocument<T>> {
    try {
      const opts = options || {};
      if (opts.userId) {
        (data as any).createdBy = opts.userId;
      }
      const doc = new model(data);
      return doc.save();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error('Error in create operation', { error: errorMsg });
      throw error;
    }
  }

  public async update<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: {
      userId?: string;
      new?: boolean;
      runValidators?: boolean;
      populate?: BasePopulateOptions[];
    }
  ): Promise<HydratedDocument<T> | null> {
    try {
      const opts = options || {};
      if (opts.userId) {
        if (!update.$set) update.$set = {};
        (update.$set as any).updatedBy = opts.userId;
      }

      const query = model.findOneAndUpdate(filter, update, {
        new: opts.new ?? true,
        runValidators: opts.runValidators ?? true,
      });

      if (opts.populate) {
        query.populate(opts.populate);
      }

      return query.exec();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error('Error in update operation', { error: errorMsg });
      throw error;
    }
  }

  public async delete<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>,
    options?: { permanent?: boolean; userId?: string }
  ): Promise<boolean> {
    try {
      const opts = options || {};
      if (opts.permanent) {
        const result = await model.deleteOne(filter).exec();
        return result.deletedCount > 0;
      }

      const update: UpdateQuery<T> = {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          ...(opts.userId && { deletedBy: opts.userId })
        }
      };

      const result = await model.updateOne(filter, update).exec();
      return result.modifiedCount > 0;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error('Error in delete operation', { error: errorMsg });
      throw error;
    }
  }

  public async restore<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>,
    options?: { userId?: string }
  ): Promise<boolean> {
    try {
      const opts = options || {};
      const update: UpdateQuery<T> = {
        $set: {
          isDeleted: false,
          ...(opts.userId && { updatedBy: opts.userId })
        },
        $unset: { deletedAt: 1, deletedBy: 1 }
      };

      const result = await model.updateOne(filter, update).exec();
      return result.modifiedCount > 0;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error('Error in restore operation', { error: errorMsg });
      throw error;
    }
  }

  public async count<T extends BaseModelFields>(
    model: Model<T>,
    filter?: FilterQuery<T>
  ): Promise<number> {
    try {
      return model.countDocuments(filter || {}).exec();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error('Error in count operation', { error: errorMsg });
      throw error;
    }
  }

  public async exists<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>
  ): Promise<boolean> {
    try {
      const count = await model.countDocuments(filter).limit(1).exec();
      return count > 0;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error('Error in exists operation', { error: errorMsg });
      throw error;
    }
  }
}