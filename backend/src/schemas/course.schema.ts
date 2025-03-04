import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { BaseDocument, baseSchemaOptions } from './base.schema';

export type CourseDocument = Course &
  Document<Types.ObjectId> & {
    students: Types.Array<UserDocument>;
    instructor: UserDocument;
  };

@Schema(baseSchemaOptions)
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  level: string;

  @Prop({ required: true })
  duration: string;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop()
  image: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  students: Types.Array<Types.ObjectId>;

  @Prop({ type: Number, required: true, default: 20 })
  maxStudents: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  instructor: Types.ObjectId;

  @Prop([String])
  prerequisites: string[];

  @Prop()
  syllabus: string;

  @Prop({ default: 0 })
  enrollmentCount: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Add text search index
CourseSchema.index({ title: 'text', description: 'text' });

// Add compound indexes for common queries
CourseSchema.index({ level: 1, isActive: 1 });
CourseSchema.index({ startDate: 1, endDate: 1 });
CourseSchema.index({ instructor: 1, isActive: 1 });

// Virtual field for checking if course is ongoing
CourseSchema.virtual('isOngoing').get(function (this: CourseDocument) {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

// Virtual field for checking if course is full
CourseSchema.virtual('isFull').get(function (this: CourseDocument) {
  return this.enrollmentCount >= this.maxStudents;
});

// Ensure virtuals are included in JSON output
CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });

// Pre-save hook to validate dates
CourseSchema.pre('save', function (next) {
  if (this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Pre-save hook to maintain enrollment count
CourseSchema.pre('save', function (next) {
  if (Array.isArray(this.students)) {
    this.enrollmentCount = this.students.length;
  }
  next();
});