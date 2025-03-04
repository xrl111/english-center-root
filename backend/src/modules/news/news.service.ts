import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News, NewsDocument } from '../../schemas/news.schema';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name) private newsModel: Model<NewsDocument>,
  ) {}

  async findAll(query: any): Promise<News[]> {
    const { search, category, isPublished, tag, limit, sort } = query;
    const filter: any = {};

    // Apply filters
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (isPublished !== undefined) {
      filter.isPublished = isPublished === 'true';
    }

    if (tag) {
      filter.tags = tag;
    }

    // Create query builder
    let queryBuilder = this.newsModel.find(filter);

    // Apply sorting
    if (sort) {
      const [field, order] = sort.split(':');
      const sortOrder = order === 'desc' ? -1 : 1;
      queryBuilder = queryBuilder.sort({ [field]: sortOrder });
    } else {
      // Default sort by publishDate desc
      queryBuilder = queryBuilder.sort({ publishDate: -1 });
    }

    // Apply limit
    if (limit) {
      queryBuilder = queryBuilder.limit(parseInt(limit, 10));
    }

    return queryBuilder.exec();
  }

  async findOne(id: string): Promise<News> {
    const news = await this.newsModel.findById(id).exec();
    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    return news;
  }

  async create(news: News): Promise<News> {
    const newNews = new this.newsModel({
      ...news,
      publishDate: news.publishDate || new Date(),
      isPublished: news.isPublished ?? true,
    });
    return newNews.save();
  }

  async update(id: string, news: News): Promise<News> {
    const updatedNews = await this.newsModel
      .findByIdAndUpdate(id, news, { new: true })
      .exec();
    if (!updatedNews) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    return updatedNews;
  }

  async delete(id: string): Promise<News> {
    const deletedNews = await this.newsModel.findByIdAndDelete(id).exec();
    if (!deletedNews) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    return deletedNews;
  }

  async findByCategory(category: string): Promise<News[]> {
    return this.newsModel
      .find({ category, isPublished: true })
      .sort({ publishDate: -1 })
      .exec();
  }

  async findByTag(tag: string): Promise<News[]> {
    return this.newsModel
      .find({ tags: tag, isPublished: true })
      .sort({ publishDate: -1 })
      .exec();
  }

  async publish(id: string): Promise<News> {
    const news = await this.findOne(id);
    news.isPublished = true;
    news.publishDate = new Date();
    return this.update(id, news);
  }

  async unpublish(id: string): Promise<News> {
    const news = await this.findOne(id);
    news.isPublished = false;
    return this.update(id, news);
  }

  async findLatest(limit: number = 5): Promise<News[]> {
    return this.newsModel
      .find({ isPublished: true })
      .sort({ publishDate: -1 })
      .limit(limit)
      .exec();
  }
}