import {
  Model,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
  Document,
} from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import {
  FilterOptions,
  PaginatedResponse,
  ServiceOptions,
} from '../utils/types';
import { AppLogger, LogMetadata } from '../services/logger.service';

function formatError(error: unknown): LogMetadata {
  if (error instanceof Error) {
    return {
      error: error.message,
      stack: error.stack,
    };
  }
  return { error: String(error) };
}

export abstract class BaseRepository<T extends Document> {
  protected constructor(
    protected readonly model: Model<T>,
    protected readonly logger: AppLogger,
    protected readonly modelName: string
  ) {
    this.logger.setContext(`${modelName}Repository`);
  }

  async findById(id: string, options?: ServiceOptions): Promise<T | null> {
    try {
      const query = this.model.findById(id);

      if (options?.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach((path) => query.populate(path));
        } else {
          query.populate(options.populate);
        }
      }

      if (options?.select) {
        query.select(options.select);
      }

      if (options?.lean) {
        query.lean();
      }

      return await query.exec();
    } catch (error) {
      this.logger.error(
        `Error finding ${this.modelName} by id: ${id}`,
        formatError(error)
      );
      throw error;
    }
  }

  async findOne(
    filter: FilterQuery<T>,
    options?: ServiceOptions
  ): Promise<T | null> {
    try {
      const query = this.model.findOne(filter);

      if (options?.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach((path) => query.populate(path));
        } else {
          query.populate(options.populate);
        }
      }

      if (options?.select) {
        query.select(options.select);
      }

      if (options?.lean) {
        query.lean();
      }

      return await query.exec();
    } catch (error) {
      this.logger.error(`Error finding ${this.modelName}`, formatError(error));
      throw error;
    }
  }

  async find(
    filter: FilterQuery<T> = {},
    options: ServiceOptions & { page?: number; limit?: number; sort?: any } = {}
  ): Promise<PaginatedResponse<T>> {
    try {
      const {
        page = 1,
        limit = 10,
        sort = { createdAt: -1 },
        populate,
        select,
        lean,
      } = options;

      const skip = (page - 1) * limit;

      const query = this.model.find(filter);

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach((path) => query.populate(path));
        } else {
          query.populate(populate);
        }
      }

      if (select) {
        query.select(select);
      }

      if (lean) {
        query.lean();
      }

      const [items, total] = await Promise.all([
        query.sort(sort).skip(skip).limit(limit).exec(),
        this.model.countDocuments(filter).exec(),
      ]);

      return {
        items,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error finding ${this.modelName}s`, formatError(error));
      throw error;
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const entity = new this.model(data);
      return await entity.save();
    } catch (error) {
      this.logger.error(`Error creating ${this.modelName}`, formatError(error));
      throw error;
    }
  }

  async update(
    id: string,
    updateData: UpdateQuery<T>,
    options?: QueryOptions
  ): Promise<T> {
    try {
      const entity = await this.model
        .findByIdAndUpdate(id, updateData, { new: true, ...options })
        .exec();

      if (!entity) {
        throw new NotFoundException(`${this.modelName} not found`);
      }

      return entity;
    } catch (error) {
      this.logger.error(
        `Error updating ${this.modelName} ${id}`,
        formatError(error)
      );
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`${this.modelName} not found`);
      }
      return true;
    } catch (error) {
      this.logger.error(
        `Error deleting ${this.modelName} ${id}`,
        formatError(error)
      );
      throw error;
    }
  }

  async softDelete(id: string): Promise<T> {
    try {
      const entity = await this.model
        .findByIdAndUpdate(
          id,
          {
            $set: {
              isActive: false,
              deletedAt: new Date(),
            },
          },
          { new: true }
        )
        .exec();

      if (!entity) {
        throw new NotFoundException(`${this.modelName} not found`);
      }

      return entity;
    } catch (error) {
      this.logger.error(
        `Error soft deleting ${this.modelName} ${id}`,
        formatError(error)
      );
      throw error;
    }
  }

  async restore(id: string): Promise<T> {
    try {
      const entity = await this.model
        .findByIdAndUpdate(
          id,
          {
            $set: {
              isActive: true,
              deletedAt: null,
            },
          },
          { new: true }
        )
        .exec();

      if (!entity) {
        throw new NotFoundException(`${this.modelName} not found`);
      }

      return entity;
    } catch (error) {
      this.logger.error(
        `Error restoring ${this.modelName} ${id}`,
        formatError(error)
      );
      throw error;
    }
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      const result = await this.model.exists(filter);
      return result !== null;
    } catch (error) {
      this.logger.error(
        `Error checking ${this.modelName} existence`,
        formatError(error)
      );
      throw error;
    }
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filter).exec();
    } catch (error) {
      this.logger.error(
        `Error counting ${this.modelName}s`,
        formatError(error)
      );
      throw error;
    }
  }
}
