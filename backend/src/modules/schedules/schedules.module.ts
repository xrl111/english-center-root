import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { Schedule, ScheduleSchema } from '../../schemas/schedule.schema';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
    ]),
    CoursesModule,
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
