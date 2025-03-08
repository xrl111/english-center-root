import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from '../../schemas/course.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
} from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  async validateObjectId(id: string): Promise<Types.ObjectId> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId: ${id}`);
    }
    return new Types.ObjectId(id);
  }

  buildQuery(queryDto: CourseQueryDto): Record<string, any> {
    const { level, startDate, endDate, isActive = true, search } = queryDto;
    const query: Record<string, any> = {};

    if (level) query.level = level;
    if (startDate) query.startDate = { $gte: new Date(startDate) };
    if (endDate) query.endDate = { $lte: new Date(endDate) };
    if (typeof isActive === 'boolean') query.isActive = isActive;
    if (search) query.$text = { $search: search };

    return query;
  }

  async findAll(queryDto: CourseQueryDto): Promise<CourseDocument[]> {
    const query = this.buildQuery(queryDto);
    return this.courseModel
      .find(query)
      .populate('instructor', 'username email')
      .populate('students', 'username email')
      .exec();
  }

  async findOne(id: string): Promise<CourseDocument> {
    const objectId = await this.validateObjectId(id);
    const course = await this.courseModel
      .findById(objectId)
      .populate('instructor', 'username email')
      .populate('students', 'username email')
      .exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async create(createDto: CreateCourseDto): Promise<CourseDocument> {
    const instructorId = await this.validateObjectId(createDto.instructor);
    const instructor = await this.userModel.findById(instructorId);

    if (!instructor) {
      throw new NotFoundException(
        `Instructor with ID ${createDto.instructor} not found`
      );
    }

    if (new Date(createDto.endDate) <= new Date(createDto.startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    const course = new this.courseModel({
      ...createDto,
      instructor: instructorId,
      students: [],
      enrollmentCount: 0,
    });

    const savedCourse = await course.save();
    await this.userModel.findByIdAndUpdate(instructorId, {
      $addToSet: { instructingCourses: savedCourse._id },
    });

    return savedCourse.populate('instructor', 'username email');
  }

  async update(
    id: string,
    updateDto: UpdateCourseDto
  ): Promise<CourseDocument> {
    const objectId = await this.validateObjectId(id);
    const course = await this.findOne(id);

    if (updateDto.instructor) {
      const newInstructorId = await this.validateObjectId(updateDto.instructor);
      const newInstructor = await this.userModel.findById(newInstructorId);

      if (!newInstructor) {
        throw new NotFoundException(
          `New instructor with ID ${updateDto.instructor} not found`
        );
      }

      if (course.instructor.toString() !== updateDto.instructor) {
        await Promise.all([
          this.userModel.findByIdAndUpdate(course.instructor, {
            $pull: { instructingCourses: objectId },
          }),
          this.userModel.findByIdAndUpdate(newInstructorId, {
            $addToSet: { instructingCourses: objectId },
          }),
        ]);
      }
    }

    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(objectId, updateDto, { new: true })
      .populate('instructor', 'username email')
      .populate('students', 'username email')
      .exec();

    if (!updatedCourse) {
      throw new NotFoundException(`Course #${id} not found`);
    }

    return updatedCourse;
  }

  async delete(id: string): Promise<void> {
    const objectId = await this.validateObjectId(id);
    const course = await this.findOne(id);

    await Promise.all([
      this.userModel.findByIdAndUpdate(course.instructor, {
        $pull: { instructingCourses: objectId },
      }),
      this.userModel.updateMany(
        { _id: { $in: course.students } },
        { $pull: { enrolledCourses: objectId } }
      ),
      course.deleteOne(),
    ]);
  }

  async addStudent(
    courseId: string,
    studentId: string
  ): Promise<CourseDocument> {
    const [courseObjectId, studentObjectId] = await Promise.all([
      this.validateObjectId(courseId),
      this.validateObjectId(studentId),
    ]);

    const [course, student] = await Promise.all([
      this.findOne(courseId),
      this.userModel.findById(studentObjectId),
    ]);

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    if (!course.isActive) {
      throw new BadRequestException('Cannot enroll in an inactive course');
    }

    if (course.enrollmentCount >= course.maxStudents) {
      throw new BadRequestException('Course is full');
    }

    const isEnrolled = course.students
      .map((id) => id.toString())
      .includes(studentObjectId.toString());

    if (isEnrolled) {
      throw new BadRequestException('Student already enrolled in this course');
    }

    course.students.push(studentObjectId);
    course.enrollmentCount = course.students.length;

    await this.userModel.findByIdAndUpdate(studentObjectId, {
      $addToSet: { enrolledCourses: courseObjectId },
    });

    return course.save();
  }

  async removeStudent(
    courseId: string,
    studentId: string
  ): Promise<CourseDocument> {
    const [courseObjectId, studentObjectId] = await Promise.all([
      this.validateObjectId(courseId),
      this.validateObjectId(studentId),
    ]);

    const course = await this.findOne(courseId);
    const studentIndex = course.students
      .map((id) => id.toString())
      .indexOf(studentObjectId.toString());

    if (studentIndex === -1) {
      throw new BadRequestException('Student not enrolled in this course');
    }

    course.students.splice(studentIndex, 1);
    course.enrollmentCount = course.students.length;

    await this.userModel.findByIdAndUpdate(studentObjectId, {
      $pull: { enrolledCourses: courseObjectId },
    });

    return course.save();
  }

  async findStudents(courseId: string): Promise<UserDocument[]> {
    const course = await this.findOne(courseId);
    return course
      .populate('students', 'username email')
      .then((c) => c.students);
  }
}
