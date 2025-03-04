import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NewsService } from './news.service';
import { News } from '../../schemas/news.schema';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all news articles' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'isPublished', required: false })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiResponse({ status: 200, description: 'Returns all news articles' })
  async findAll(@Query() query: any): Promise<News[]> {
    return this.newsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a news article by ID' })
  @ApiParam({ name: 'id', description: 'News article ID' })
  @ApiResponse({ status: 200, description: 'Returns the news article' })
  @ApiResponse({ status: 404, description: 'News article not found' })
  async findOne(@Param('id') id: string): Promise<News> {
    return this.newsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new news article' })
  @ApiResponse({ status: 201, description: 'News article created successfully' })
  async create(@Body() news: News): Promise<News> {
    return this.newsService.create(news);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a news article' })
  @ApiParam({ name: 'id', description: 'News article ID' })
  @ApiResponse({ status: 200, description: 'News article updated successfully' })
  @ApiResponse({ status: 404, description: 'News article not found' })
  async update(
    @Param('id') id: string,
    @Body() news: News,
  ): Promise<News> {
    return this.newsService.update(id, news);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a news article' })
  @ApiParam({ name: 'id', description: 'News article ID' })
  @ApiResponse({ status: 200, description: 'News article deleted successfully' })
  @ApiResponse({ status: 404, description: 'News article not found' })
  async delete(@Param('id') id: string): Promise<News> {
    return this.newsService.delete(id);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get news articles by category' })
  @ApiParam({ name: 'category', description: 'News category' })
  @ApiResponse({ status: 200, description: 'Returns news articles by category' })
  async findByCategory(@Param('category') category: string): Promise<News[]> {
    return this.newsService.findByCategory(category);
  }

  @Get('tag/:tag')
  @ApiOperation({ summary: 'Get news articles by tag' })
  @ApiParam({ name: 'tag', description: 'News tag' })
  @ApiResponse({ status: 200, description: 'Returns news articles by tag' })
  async findByTag(@Param('tag') tag: string): Promise<News[]> {
    return this.newsService.findByTag(tag);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a news article' })
  @ApiParam({ name: 'id', description: 'News article ID' })
  @ApiResponse({ status: 200, description: 'News article published successfully' })
  @ApiResponse({ status: 404, description: 'News article not found' })
  @HttpCode(200)
  async publish(@Param('id') id: string): Promise<News> {
    return this.newsService.publish(id);
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish a news article' })
  @ApiParam({ name: 'id', description: 'News article ID' })
  @ApiResponse({ status: 200, description: 'News article unpublished successfully' })
  @ApiResponse({ status: 404, description: 'News article not found' })
  @HttpCode(200)
  async unpublish(@Param('id') id: string): Promise<News> {
    return this.newsService.unpublish(id);
  }

  @Get('latest/:limit')
  @ApiOperation({ summary: 'Get latest news articles' })
  @ApiParam({ name: 'limit', description: 'Number of articles to return' })
  @ApiResponse({ status: 200, description: 'Returns latest news articles' })
  async findLatest(@Param('limit') limit: number): Promise<News[]> {
    return this.newsService.findLatest(limit);
  }
}