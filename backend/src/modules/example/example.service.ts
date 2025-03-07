import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery } from 'mongoose';
import { BaseService } from '../../services/base.service';
import { DatabaseService } from '../../services/database.service';
import { AppLogger } from '../../services/logger.service';
import { BaseDocument, BasePopulateOptions, BaseSortOptions } from '../../schemas/base.schema';
import {
  Example,
  ExampleDocument,
  ExampleModel,
  CreateExampleInput,
  UpdateExampleInput,
  ExampleQueryOptions,
} from './schemas/example.schema';
import {
  PaginationDto,
  PaginatedResult,
  createPaginatedResponse,
  normalizePagination,
} from '../../common/dto/pagination.dto';

@Injectable()
export class ExampleService extends BaseService<ExampleDocument> {
  constructor(
    @InjectModel(Example.name) private readonly exampleModel: ExampleModel,
    databaseService: DatabaseService,
    logger: AppLogger
  ) {
    super(exampleModel, databaseService, logger, Example.name);
  }

  async create(input: CreateExampleInput): Promise<ExampleDocument> {
    const created = new this.exampleModel({
      ...input,
      isActive: input.isActive ?? true,
    });
    return created.save();
  }

  async update(
    id: string,
    input: UpdateExampleInput,
    options: { runValidators?: boolean } = {}
  ): Promise<ExampleDocument> {
    const updated = await this.exampleModel
      .findByIdAndUpdate(
        id,
        { ...input, updatedAt: new Date() },
        { new: true, runValidators: options.runValidators ?? true }
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Example with ID ${id} not found`);
    }

    return updated;
  }

  async findById(id: string): Promise<ExampleDocument> {
    const example = await this.exampleModel.findById(id).exec();
    if (!example) {
      throw new NotFoundException(`Example with ID ${id} not found`);
    }
    return example;
  }

  async findByName(name: string): Promise<ExampleDocument | null> {
    return this.exampleModel.findByName(name);
  }

  // Override base findAll to match parent signature
  async findAll(
    filter: FilterQuery<ExampleDocument> = {},
    options: {
      populate?: BasePopulateOptions[];
      select?: string;
      sort?: BaseSortOptions;
      limit?: number;
      skip?: number;
      lean?: boolean;
    } = {}
  ): Promise<ExampleDocument[]> {
    return super.findAll(filter, options);
  }

  // Add new method for paginated results
  async findAllPaginated(options: ExampleQueryOptions = {}): Promise<PaginatedResult<ExampleDocument>> {
    const { isActive, name, pagination: paginationOpts } = options;
    const pagination = paginationOpts || normalizePagination();
    const query: FilterQuery<ExampleDocument> = {};

    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const [items, totalItems] = await Promise.all([
      this.exampleModel
        .find(query)
        .skip(pagination.getOffset())
        .limit(pagination.getLimit())
        .sort({ createdAt: -1 })
        .exec(),
      this.exampleModel.countDocuments(query).exec(),
    ]);

    return createPaginatedResponse(items, totalItems, pagination);
  }

  async findActive(): Promise<ExampleDocument[]> {
    return this.exampleModel.findActive();
  }

  async toggleActive(id: string): Promise<ExampleDocument> {
    const example = await this.findById(id);
    return example.toggleActive();
  }

  async deleteById(id: string): Promise<void> {
    const result = await this.exampleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Example with ID ${id} not found`);
    }
  }

  override async exists(filter: FilterQuery<ExampleDocument>): Promise<boolean> {
    const count = await this.exampleModel.countDocuments(filter).exec();
    return count > 0;
  }

  async validateName(name: string, excludeId?: string): Promise<boolean> {
    const query: FilterQuery<ExampleDocument> = { name };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return !(await this.exists(query));
  }
}