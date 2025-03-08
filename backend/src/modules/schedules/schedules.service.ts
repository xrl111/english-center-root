import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Schedule,
  ScheduleDocument,
  ScheduleStatus,
} from '../../schemas/schedule.schema';
import { AppLogger, LogMetadata } from '../../services/logger.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/schedule.dto';

function formatError(error: unknown): LogMetadata {
  if (error instanceof Error) {
    return {
      error: error.message,
      stack: error.stack,
    };
  }
  return { error: String(error) };
}

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext('SchedulesService');
  }

  async create(
    createScheduleDto: CreateScheduleDto
  ): Promise<ScheduleDocument> {
    try {
      const schedule = new this.scheduleModel(createScheduleDto);
      return await schedule.save();
    } catch (error) {
      this.logger.error('Error creating schedule', formatError(error));
      throw error;
    }
  }

  async findAll(query: any = {}): Promise<ScheduleDocument[]> {
    try {
      return await this.scheduleModel
        .find(query)
        .populate('course', 'title')
        .populate('instructor', 'username email')
        .sort({ startDate: 1 })
        .exec();
    } catch (error) {
      this.logger.error('Error finding schedules', formatError(error));
      throw error;
    }
  }

  async findOne(id: string): Promise<ScheduleDocument> {
    try {
      const schedule = await this.scheduleModel
        .findById(id)
        .populate('course', 'title description')
        .populate('instructor', 'username email')
        .populate('attendees', 'username email')
        .exec();

      if (!schedule) {
        throw new NotFoundException(`Schedule #${id} not found`);
      }

      return schedule;
    } catch (error) {
      this.logger.error(`Error finding schedule ${id}`, formatError(error));
      throw error;
    }
  }

  async update(
    id: string,
    updateScheduleDto: UpdateScheduleDto
  ): Promise<ScheduleDocument> {
    try {
      const schedule = await this.scheduleModel
        .findByIdAndUpdate(id, updateScheduleDto, { new: true })
        .exec();

      if (!schedule) {
        throw new NotFoundException(`Schedule #${id} not found`);
      }

      return schedule;
    } catch (error) {
      this.logger.error(`Error updating schedule ${id}`, formatError(error));
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const schedule = await this.scheduleModel.findById(id);
      if (!schedule) {
        throw new NotFoundException(`Schedule #${id} not found`);
      }

      if (schedule.status === ScheduleStatus.CANCELLED) {
        throw new BadRequestException('Schedule is already cancelled');
      }

      await schedule.deleteOne();
    } catch (error) {
      this.logger.error(`Error removing schedule ${id}`, formatError(error));
      throw error;
    }
  }

  async addAttendee(
    scheduleId: string,
    userId: string
  ): Promise<ScheduleDocument> {
    try {
      const schedule = await this.findOne(scheduleId);
      const userObjectId = new Types.ObjectId(userId);

      await schedule.addAttendee(userObjectId);
      return schedule;
    } catch (error) {
      this.logger.error(
        `Error adding attendee ${userId} to schedule ${scheduleId}`,
        formatError(error)
      );
      throw error;
    }
  }

  async removeAttendee(
    scheduleId: string,
    userId: string
  ): Promise<ScheduleDocument> {
    try {
      const schedule = await this.findOne(scheduleId);
      const userObjectId = new Types.ObjectId(userId);

      await schedule.removeAttendee(userObjectId);
      return schedule;
    } catch (error) {
      this.logger.error(
        `Error removing attendee ${userId} from schedule ${scheduleId}`,
        formatError(error)
      );
      throw error;
    }
  }

  async cancel(id: string, reason: string): Promise<ScheduleDocument> {
    try {
      const schedule = await this.findOne(id);
      await schedule.cancel(reason);
      return schedule;
    } catch (error) {
      this.logger.error(`Error cancelling schedule ${id}`, formatError(error));
      throw error;
    }
  }

  async findUpcoming(): Promise<ScheduleDocument[]> {
    try {
      return await this.scheduleModel
        .find({
          startDate: { $gt: new Date() },
          status: { $ne: ScheduleStatus.CANCELLED },
        })
        .sort({ startDate: 1 })
        .limit(10)
        .populate('course', 'title')
        .populate('instructor', 'username')
        .exec();
    } catch (error) {
      this.logger.error('Error finding upcoming schedules', formatError(error));
      throw error;
    }
  }

  async updateStatuses(): Promise<void> {
    try {
      const schedules = await this.scheduleModel
        .find({
          status: { $ne: ScheduleStatus.CANCELLED },
        })
        .exec();

      await Promise.all(schedules.map((schedule) => schedule.updateStatus()));
    } catch (error) {
      this.logger.error('Error updating schedule statuses', formatError(error));
      throw error;
    }
  }
}
