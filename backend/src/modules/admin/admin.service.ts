import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../../schemas/course.schema';
import { News } from '../../schemas/news.schema';
import { Schedule } from '../../schemas/schedule.schema';
import { User } from '../../schemas/user.schema';
import { endOfWeek, startOfWeek, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(News.name) private newsModel: Model<News>,
    @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getDashboardStats() {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [
      courses,
      upcomingClasses,
      activeNews,
      users,
      newUsers,
      weeklyClasses,
      monthlyNews,
    ] = await Promise.all([
      // Total courses
      this.courseModel.countDocuments({ isActive: true }),
      
      // Upcoming classes
      this.scheduleModel.countDocuments({
        startTime: { $gt: now },
        isCanceled: false,
      }),
      
      // Active news articles
      this.newsModel.countDocuments({ isPublished: true }),
      
      // Total users
      this.userModel.countDocuments({ isActive: true }),
      
      // New users this week
      this.userModel.countDocuments({
        createdAt: { $gte: weekStart, $lte: weekEnd },
      }),
      
      // Classes this week
      this.scheduleModel.countDocuments({
        startTime: { $gte: weekStart, $lte: weekEnd },
        isCanceled: false,
      }),
      
      // Published news this month
      this.newsModel.countDocuments({
        publishDate: { $gte: monthStart, $lte: monthEnd },
        isPublished: true,
      }),
    ]);

    return {
      courses,
      upcomingClasses,
      activeNews,
      users,
      newUsers,
      weeklyClasses,
      monthlyNews,
      activeSessions: 0, // This would need a session tracking system
    };
  }

  async getRecentActivity() {
    // This would typically be implemented with an activity log collection
    // For now, we'll return recent content changes
    const [recentNews, recentSchedules] = await Promise.all([
      this.newsModel
        .find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title updatedAt'),
      
      this.scheduleModel
        .find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title updatedAt'),
    ]);

    // Combine and sort activities
    const activities = [
      ...recentNews.map(news => ({
        id: news._id,
        description: `News article "${news.title}" was updated`,
        timestamp: news.updatedAt,
        type: 'news',
      })),
      ...recentSchedules.map(schedule => ({
        id: schedule._id,
        description: `Class "${schedule.title}" was updated`,
        timestamp: schedule.updatedAt,
        type: 'schedule',
      })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

    return activities;
  }

  async getSystemHealth() {
    return {
      status: 'healthy',
      lastChecked: new Date(),
      services: {
        database: 'connected',
        api: 'operational',
      },
    };
  }
}