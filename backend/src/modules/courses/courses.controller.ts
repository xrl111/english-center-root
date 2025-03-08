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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types/roles';
import { CoursesService } from './courses.service';
import { Course } from '../../schemas/course.schema';
import { User } from '../../schemas/user.schema';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
  EnrollmentDto,
} from './dto/course.dto';

@ApiTags('courses')
@Controller('api/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({
    status: 200,
    description: 'Returns all courses',
    type: [Course],
  })
  async findAll(@Query() query: CourseQueryDto): Promise<Course[]> {
    return this.coursesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiResponse({ status: 200, description: 'Returns the course', type: Course })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id') id: string): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    type: Course,
  })
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.coursesService.create(createCourseDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    type: Course,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto
  ): Promise<Course> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.coursesService.delete(id);
  }

  @Get(':id/students')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get students enrolled in a course' })
  @ApiResponse({
    status: 200,
    description: 'Returns enrolled students',
    type: [User],
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findStudents(@Param('id') id: string): Promise<User[]> {
    return this.coursesService.findStudents(id);
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enroll a student in a course' })
  @ApiResponse({
    status: 200,
    description: 'Student enrolled successfully',
    type: Course,
  })
  @ApiResponse({ status: 404, description: 'Course or student not found' })
  async addStudent(
    @Param('id') courseId: string,
    @Body() enrollmentDto: EnrollmentDto
  ): Promise<Course> {
    return this.coursesService.addStudent(courseId, enrollmentDto.studentId);
  }

  @Delete(':id/students/:studentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a student from a course' })
  @ApiResponse({
    status: 200,
    description: 'Student removed successfully',
    type: Course,
  })
  @ApiResponse({ status: 404, description: 'Course or student not found' })
  async removeStudent(
    @Param('id') courseId: string,
    @Param('studentId') studentId: string
  ): Promise<Course> {
    return this.coursesService.removeStudent(courseId, studentId);
  }
}
