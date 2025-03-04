import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule, ScheduleDocument } from '../../schemas/schedule.schema';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
    private readonly coursesService: CoursesService,
  ) {}

  async findAll(query: any): Promise<Schedule[]> {
    const { courseId, instructor, startDate, endDate } = query;
    const filter: any = {};

    if (courseId) {
      filter.course = courseId;
    }

    if (instructor) {
      filter.instructor = instructor;
    }

    if (startDate && endDate) {
      filter.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return this.scheduleModel
      .find(filter)
      .populate('course')
      .sort({ startTime: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Schedule> {
    const schedule = await this.scheduleModel
      .findById(id)
      .populate('course')
      .exec();
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    return schedule;
  }

  async create(schedule: Schedule): Promise<Schedule> {
    // Verify course exists
    await this.coursesService.findOne(schedule.course.toString());
    const newSchedule = new this.scheduleModel(schedule);
    return newSchedule.save();
  }

  async update(id: string, schedule: Schedule): Promise<Schedule> {
    // Verify course exists
    if (schedule.course) {
      await this.coursesService.findOne(schedule.course.toString());
    }

    const updatedSchedule = await this.scheduleModel
      .findByIdAndUpdate(id, schedule, { new: true })
      .populate('course')
      .exec();
    if (!updatedSchedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    return updatedSchedule;
  }

  async delete(id: string): Promise<Schedule> {
    const deletedSchedule = await this.scheduleModel
      .findByIdAndDelete(id)
      .populate('course')
      .exec();
    if (!deletedSchedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    return deletedSchedule;
  }

  async findByCourse(courseId: string): Promise<Schedule[]> {
    return this.scheduleModel
      .find({ course: courseId })
      .populate('course')
      .sort({ startTime: 1 })
      .exec();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Schedule[]> {
    return this.scheduleModel
      .find({
        startTime: { $gte: startDate },
        endTime: { $lte: endDate },
      })
      .populate('course')
      .sort({ startTime: 1 })
      .exec();
  }

  async cancelClass(id: string): Promise<Schedule> {
    const schedule = await this.findOne(id);
    schedule.isCanceled = true;
    return this.update(id, schedule);
  }

  async restoreClass(id: string): Promise<Schedule> {
    const schedule = await this.findOne(id);
    schedule.isCanceled = false;
    return this.update(id, schedule);
  }

  async addAttendee(id: string, attendeeId: string): Promise<Schedule> {
    const schedule = await this.findOne(id);
    if (!schedule.attendees.includes(attendeeId)) {
      schedule.attendees.push(attendeeId);
      return this.update(id, schedule);
    }
    return schedule;
  }

  async removeAttendee(id: string, attendeeId: string): Promise<Schedule> {
    const schedule = await this.findOne(id);
    schedule.attendees = schedule.attendees.filter((id) => id !== attendeeId);
    return this.update(id, schedule);
  }
}