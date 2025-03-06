import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from '../../schemas/course.schema';
import { News, NewsDocument } from '../../schemas/news.schema';
import { Schedule, ScheduleDocument } from '../../schemas/schedule.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { AppLogger } from '../../services/logger.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(News.name) private newsModel: Model<NewsDocument>,
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private logger: AppLogger,
  ) {
    this.logger.setContext('AdminService');
  }

  async getDashboardStats() {
    try {
      const [
        totalCourses,
        activeCourses,
        totalUsers,
        activeUsers,
        totalNews,
        publishedNews,
        upcomingSchedules,
      ] = await Promise.all([
        this.courseModel.countDocuments(),
        this.courseModel.countDocuments({ isActive: true }),
        this.userModel.countDocuments(),
        this.userModel.countDocuments({ isActive: true }),
        this.newsModel.countDocuments(),
        this.newsModel.countDocuments({ isPublished: true }),
        this.scheduleModel.countDocuments({
          startDate: { $gte: new Date() },
        }),
      ]);

      return {
        courses: {
          total: totalCourses,
          active: activeCourses,
          inactive: totalCourses - activeCourses,
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
        },
        news: {
          total: totalNews,
          published: publishedNews,
          drafts: totalNews - publishedNews,
        },
        schedules: {
          upcoming: upcomingSchedules,
        },
      };
    } catch (error) {
      this.logger.error('Error getting dashboard stats', error.stack);
      throw error;
    }
  }

  async getRecentActivity() {
    try {
      const [recentCourses, recentNews, recentSchedules] = await Promise.all([
        this.courseModel
          .find()
          .sort({ updatedAt: -1 })
          .limit(5)
          .populate('instructor', 'username email'),
        this.newsModel
          .find()
          .sort({ updatedAt: -1 })
          .limit(5),
        this.scheduleModel
          .find({ startDate: { $gte: new Date() } })
          .sort({ startDate: 1 })
          .limit(5)
          .populate('course', 'title'),
      ]);

      return {
        recentCourses,
        recentNews,
        recentSchedules,
      };
    } catch (error) {
      this.logger.error('Error getting recent activity', error.stack);
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const dbStatus = await this.checkDatabaseHealth();
      const servicesStatus = await this.checkServicesHealth();

      return {
        database: dbStatus,
        services: servicesStatus,
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
        },
      };
    } catch (error) {
      this.logger.error('Error checking system health', error.stack);
      throw error;
    }
  }

  private async checkDatabaseHealth() {
    try {
      await Promise.all([
        this.courseModel.findOne(),
        this.newsModel.findOne(),
        this.scheduleModel.findOne(),
        this.userModel.findOne(),
      ]);

      return {
        status: 'healthy',
        latency: await this.measureDbLatency(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  private async checkServicesHealth() {
    const services = {
      fileUpload: await this.checkFileUploadService(),
      email: await this.checkEmailService(),
      cache: await this.checkCacheService(),
    };

    return services;
  }

  private async measureDbLatency(): Promise<number> {
    const start = Date.now();
    await this.courseModel.findOne();
    return Date.now() - start;
  }

  private async checkFileUploadService() {
    // Implement file upload service health check
    return { status: 'healthy' };
  }

  private async checkEmailService() {
    // Implement email service health check
    return { status: 'healthy' };
  }

  private async checkCacheService() {
    // Implement cache service health check
    return { status: 'healthy' };
  }
}