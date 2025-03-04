import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { Schedule } from '../../schemas/schedule.schema';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  async findAll(@Query() query: any): Promise<Schedule[]> {
    return this.schedulesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Schedule> {
    return this.schedulesService.findOne(id);
  }

  @Post()
  async create(@Body() schedule: Schedule): Promise<Schedule> {
    return this.schedulesService.create(schedule);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() schedule: Schedule,
  ): Promise<Schedule> {
    return this.schedulesService.update(id, schedule);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Schedule> {
    return this.schedulesService.delete(id);
  }

  @Get('course/:courseId')
  async findByCourse(@Param('courseId') courseId: string): Promise<Schedule[]> {
    return this.schedulesService.findByCourse(courseId);
  }

  @Get('date-range')
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Schedule[]> {
    return this.schedulesService.findByDateRange(new Date(startDate), new Date(endDate));
  }

  @Post(':id/cancel')
  async cancelClass(@Param('id') id: string): Promise<Schedule> {
    return this.schedulesService.cancelClass(id);
  }

  @Post(':id/restore')
  async restoreClass(@Param('id') id: string): Promise<Schedule> {
    return this.schedulesService.restoreClass(id);
  }

  @Post(':id/attendees')
  async addAttendee(
    @Param('id') id: string,
    @Body('attendeeId') attendeeId: string,
  ): Promise<Schedule> {
    return this.schedulesService.addAttendee(id, attendeeId);
  }

  @Delete(':id/attendees/:attendeeId')
  async removeAttendee(
    @Param('id') id: string,
    @Param('attendeeId') attendeeId: string,
  ): Promise<Schedule> {
    return this.schedulesService.removeAttendee(id, attendeeId);
  }
}