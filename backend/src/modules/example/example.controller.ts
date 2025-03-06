import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../modules/auth/guards/auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { UserRole } from '../../modules/auth/types/user-role.enum';
import { ExampleService } from './example.service';
import {
  CreateExampleInput,
  UpdateExampleInput,
  ExampleDocument,
} from './schemas/example.schema';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('examples')
@Controller('examples')
@UseGuards(AuthGuard, RolesGuard)
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new example' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Successfully created' })
  async create(
    @Body(new ValidationPipe({ transform: true })) input: CreateExampleInput
  ): Promise<ExampleDocument> {
    return this.exampleService.create(input);
  }

  @Get()
  @ApiOperation({ summary: 'Get all examples' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all examples' })
  async findAll(
    @Query(new ValidationPipe({ transform: true })) pagination: PaginationDto,
    @Query('isActive') isActive?: boolean,
    @Query('name') name?: string
  ) {
    return this.exampleService.findAll({
      isActive,
      name,
      pagination,
    });
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active examples' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return active examples' })
  async findActive(): Promise<ExampleDocument[]> {
    return this.exampleService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get example by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return found example' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Example not found' })
  async findOne(@Param('id') id: string): Promise<ExampleDocument> {
    return this.exampleService.findById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update example' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Example not found' })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) input: UpdateExampleInput
  ): Promise<ExampleDocument> {
    return this.exampleService.update(id, input);
  }

  @Put(':id/toggle')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle example active status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully toggled' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Example not found' })
  async toggleActive(@Param('id') id: string): Promise<ExampleDocument> {
    return this.exampleService.toggleActive(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete example' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Successfully deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Example not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.exampleService.deleteById(id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Find example by name' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return found example' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Example not found' })
  async findByName(@Param('name') name: string): Promise<ExampleDocument | null> {
    return this.exampleService.findByName(name);
  }

  @Post('validate-name')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Validate example name' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return validation result' })
  async validateName(
    @Body('name') name: string,
    @Body('excludeId') excludeId?: string
  ): Promise<{ isValid: boolean }> {
    const isValid = await this.exampleService.validateName(name, excludeId);
    return { isValid };
  }
}