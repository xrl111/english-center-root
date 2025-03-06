import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  ScheduleQueryDto,
  AttendeeDto,
  CancelScheduleDto,
} from './dto/schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types/roles';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Schedule } from '../../schemas/schedule.schema';

@ApiTags('schedules')
@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Create a new schedule' })
  @ApiResponse({
    status: 201,
    description: 'The schedule has been successfully created.',
    type: Schedule,
  })
  async create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all schedules' })
  @ApiResponse({
    status: 200,
    description: 'Return all schedules.',
    type: [Schedule],
  })
  async findAll(@Query() query: ScheduleQueryDto) {
    return this.schedulesService.findAll(query);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming schedules' })
  @ApiResponse({
    status: 200,
    description: 'Return upcoming schedules.',
    type: [Schedule],
  })
  async findUpcoming() {
    return this.schedulesService.findUpcoming();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a schedule by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the schedule.',
    type: Schedule,
  })
  async findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Update a schedule' })
  @ApiResponse({
    status: 200,
    description: 'The schedule has been successfully updated.',
    type: Schedule,
  })
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto
  ) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a schedule' })
  @ApiResponse({ status: 204, description: 'The schedule has been deleted.' })
  async remove(@Param('id') id: string) {
    await this.schedulesService.remove(id);
  }

  @Post(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Cancel a schedule' })
  @ApiResponse({
    status: 200,
    description: 'The schedule has been cancelled.',
    type: Schedule,
  })
  async cancel(
    @Param('id') id: string,
    @Body() cancelScheduleDto: CancelScheduleDto
  ) {
    return this.schedulesService.cancel(id, cancelScheduleDto.reason);
  }

  @Post(':id/attendees')
  @ApiOperation({ summary: 'Add attendee to schedule' })
  @ApiResponse({
    status: 200,
    description: 'The attendee has been added.',
    type: Schedule,
  })
  async addAttendee(
    @Param('id') id: string,
    @Body() attendeeDto: AttendeeDto
  ) {
    return this.schedulesService.addAttendee(id, attendeeDto.userId);
  }

  @Delete(':id/attendees/:userId')
  @ApiOperation({ summary: 'Remove attendee from schedule' })
  @ApiResponse({
    status: 200,
    description: 'The attendee has been removed.',
    type: Schedule,
  })
  async removeAttendee(
    @Param('id') id: string,
    @Param('userId') userId: string
  ) {
    return this.schedulesService.removeAttendee(id, userId);
  }
}