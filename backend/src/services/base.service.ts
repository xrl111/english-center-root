import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, FilterQuery, UpdateQuery } from 'mongoose';
import { DatabaseService } from './database.service';
import { AppLogger } from './logger.service';
import {
  BaseDocument,
  BasePopulateOptions,
  BaseSortOptions,
} from '../schemas/base.schema';

@Injectable()
export abstract class BaseService<T extends BaseDocument> {
  protected constructor(
    protected readonly model: Model<T>,
    protected readonly databaseService: DatabaseService,
    protected readonly logger: AppLogger,
    protected readonly modelName: string,
  ) {
    this.logger.setContext(modelName + 'Service');
  }

  async findById(
    id: string,
    options: {
      populate?: BasePopulateOptions[];
      select?: string;
      lean?: boolean;
    } = {}
  ): Promise<T> {
    const doc = await this.databaseService.findOne(this.model, { _id: id }, options);
    if (!doc) {
      throw new NotFoundException(`${this.modelName} #${id} not found`);
    }
    return doc;
  }

  async findOne(
    filter: FilterQuery<T>,
    options: {
      populate?: BasePopulateOptions[];
      select?: string;
      lean?: boolean;
    } = {}
  ): Promise<T | null> {
    return this.databaseService.findOne(this.model, filter, options);
  }

  async findAll(
    filter: FilterQuery<T> = {},
    options: {
      populate?: BasePopulateOptions[];
      select?: string;
      sort?: BaseSortOptions;
      limit?: number;
      skip?: number;
      lean?: boolean;
    } = {}
  ): Promise<T[]> {
    return this.databaseService.find(this.model, filter, options);
  }

  async create(
    data: Partial<T>,
    options: {
      userId?: string;
    } = {}
  ): Promise<T> {
    try {
      return await this.databaseService.create(this.model, data, options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.logger.error(`Error creating ${this.modelName}`, { error: errorMessage });
      throw error;
    }
  }

  async update(
    id: string,
    update: UpdateQuery<T>,
    options: {
      userId?: string;
      new?: boolean;
      runValidators?: boolean;
      populate?: BasePopulateOptions[];
    } = {}
  ): Promise<T> {
    const doc = await this.databaseService.update(
      this.model,
      { _id: id },
      update,
      options
    );

    if (!doc) {
      throw new NotFoundException(`${this.modelName} #${id} not found`);
    }

    return doc;
  }

  async delete(
    id: string,
    options: {
      userId?: string;
      permanent?: boolean;
    } = {}
  ): Promise<boolean> {
    const deleted = await this.databaseService.delete(
      this.model,
      { _id: id },
      options
    );

    if (!deleted) {
      throw new NotFoundException(`${this.modelName} #${id} not found`);
    }

    return true;
  }

  async restore(
    id: string,
    options: {
      userId?: string;
    } = {}
  ): Promise<boolean> {
    const restored = await this.databaseService.restore(
      this.model,
      { _id: id },
      options
    );

    if (!restored) {
      throw new NotFoundException(`${this.modelName} #${id} not found`);
    }

    return true;
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.databaseService.count(this.model, filter);
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    return this.databaseService.exists(this.model, filter);
  }

  async findOneOrCreate(
    filter: FilterQuery<T>,
    data: Partial<T>,
    options: {
      userId?: string;
      populate?: BasePopulateOptions[];
    } = {}
  ): Promise<T> {
    let doc = await this.findOne(filter, { populate: options.populate });
    
    if (!doc) {
      doc = await this.create(data, { userId: options.userId });
      if (options.populate) {
        doc = await this.findById(doc.id, { populate: options.populate });
      }
    }

    return doc;
  }

  async updateMany(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options: {
      userId?: string;
    } = {}
  ): Promise<number> {
    try {
      if (options.userId) {
        update.$set = {
          ...(update.$set || {}),
          updatedBy: options.userId,
        };
      }

      const result = await this.model.updateMany(filter, update).exec();
      return result.modifiedCount;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.logger.error(`Error updating many ${this.modelName}s`, { error: errorMessage });
      throw error;
    }
  }

  async deleteMany(
    filter: FilterQuery<T>,
    options: {
      userId?: string;
      permanent?: boolean;
    } = {}
  ): Promise<number> {
    try {
      if (options.permanent) {
        const result = await this.model.deleteMany(filter).exec();
        return result.deletedCount;
      }

      const update: UpdateQuery<T> = {
        $set: {
          isActive: false,
          deletedAt: new Date(),
          ...(options.userId && { updatedBy: options.userId }),
        },
      };

      const result = await this.model.updateMany(filter, update).exec();
      return result.modifiedCount;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.logger.error(`Error deleting many ${this.modelName}s`, { error: errorMessage });
      throw error;
    }
  }
}