import {
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { BaseService } from '../services/base.service';
import { BaseDocument } from '../schemas/base.schema';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export abstract class BaseController<T extends BaseDocument> {
  protected constructor(
    protected readonly service: BaseService<T>,
    protected readonly modelName: string
  ) {}

  private getOperationDescription(operation: string): string {
    return `${operation} ${this.modelName}`;
  }

  @Get()
  @ApiOperation({ summary: 'Get all items' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns a paginated list of items',
  })
  async findAll(@Query() query: PaginationQuery): Promise<PaginatedResponse<T>> {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search,
    } = query;

    const skip = (page - 1) * limit;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const [items, total] = await Promise.all([
      this.service.findAll(filter, {
        skip,
        limit,
        sort: { [sort]: order === 'asc' ? 1 : -1 },
      }),
      this.service.count(filter),
    ]);

    return {
      items,
      total,
      page: +page,
      limit: +limit,
      pages: Math.ceil(total / limit),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns an item by id',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Item not found',
  })
  async findOne(@Param('id') id: string): Promise<T> {
    const item = await this.service.findById(id);
    if (!item) {
      throw new NotFoundException(`${this.modelName} #${id} not found`);
    }
    return item;
  }

  @Post()
  @ApiOperation({ summary: 'Create item' })
  @ApiBody({ description: 'Item data' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Creates a new item',
  })
  async create(@Body() data: Partial<T>): Promise<T> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update item' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ description: 'Item data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updates an item',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Item not found',
  })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<T>
  ): Promise<T> {
    return this.service.update(id, { $set: data });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete item' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Deletes an item',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Item not found',
  })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.delete(id);
    return { success: true };
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore item' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Restores a deleted item',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Item not found',
  })
  async restore(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.restore(id);
    return { success: true };
  }

  protected formatResponse<R>(data: R, message?: string) {
    return {
      success: true,
      message: message || `${this.modelName} operation successful`,
      data,
    };
  }

  protected formatPaginatedResponse<R>(
    data: PaginatedResponse<R>,
    message?: string
  ) {
    return {
      success: true,
      message: message || `${this.modelName} list retrieved successfully`,
      data: data.items,
      pagination: {
        total: data.total,
        page: data.page,
        limit: data.limit,
        pages: data.pages,
      },
    };
  }

  protected formatError(error: any) {
    return {
      success: false,
      message: `${this.modelName} operation failed: ${error.message}`,
      error: {
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        details: error.details || null,
      },
    };
  }
}