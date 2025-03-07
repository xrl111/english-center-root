import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { BaseSchema, baseSchemaOptions, BaseDocument } from './base.schema';

export interface ScheduleVirtuals {
  isFull: boolean;
  isOngoing: boolean;
  isUpcoming: boolean;
}

export interface ScheduleMethods {
  cancel(reason: string): Promise<ScheduleDocument>;
  addAttendee(userId: string | Types.ObjectId): Promise<ScheduleDocument>;
  removeAttendee(userId: string | Types.ObjectId): Promise<ScheduleDocument>;
  updateStatus(): Promise<ScheduleDocument>;
  deleteOne(): Promise<ScheduleDocument | null>;
}

export type ScheduleDocument = Schedule &
  Document &
  ScheduleVirtuals &
  ScheduleMethods;

export enum ScheduleStatus {
  PENDING = 'pending',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema(baseSchemaOptions)
export class Schedule extends BaseSchema {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  instructor!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ type: Date, required: true, index: true })
  startDate!: Date;

  @Prop({ type: Date, required: true, index: true })
  endDate!: Date;

  @Prop({ required: true })
  duration!: string;

  @Prop({ required: true })
  location!: string;

  @Prop()
  description?: string;

  @Prop({ type: Number, required: true, default: 0 })
  maxAttendees!: number;

  @Prop({ type: Number, default: 0 })
  currentAttendees!: number;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  attendees!: Types.ObjectId[];

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({
    type: String,
    enum: Object.values(ScheduleStatus),
    default: ScheduleStatus.PENDING,
  })
  status!: ScheduleStatus;

  @Prop()
  cancellationReason?: string;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

// Add compound index for efficient querying
ScheduleSchema.index({ startDate: 1, endDate: 1, isActive: 1 });

// Add virtual fields
ScheduleSchema.virtual('isFull').get(function (this: ScheduleDocument) {
  return this.currentAttendees >= this.maxAttendees;
});

ScheduleSchema.virtual('isOngoing').get(function (this: ScheduleDocument) {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

ScheduleSchema.virtual('isUpcoming').get(function (this: ScheduleDocument) {
  return new Date() < this.startDate;
});

// Methods
ScheduleSchema.methods = {
  cancel: function (
    this: ScheduleDocument,
    reason: string
  ): Promise<ScheduleDocument> {
    this.isActive = false;
    this.status = ScheduleStatus.CANCELLED;
    this.cancellationReason = reason;
    return this.save();
  },

  addAttendee: function (
    this: ScheduleDocument,
    userId: string | Types.ObjectId
  ): Promise<ScheduleDocument> {
    if (this.isFull) {
      throw new Error('Schedule is full');
    }

    if (!this.isActive) {
      throw new Error('Schedule is not active');
    }

    const userObjectId =
      typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    if (this.attendees.some((id: Types.ObjectId) => id.equals(userObjectId))) {
      throw new Error('User is already registered');
    }

    this.attendees.push(userObjectId);
    this.currentAttendees = this.attendees.length;
    return this.save();
  },

  removeAttendee: async function (
    userId: string | Types.ObjectId
  ): Promise<ScheduleDocument> {
    const userObjectId =
      typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    const index = this.attendees.findIndex((id: Types.ObjectId) =>
      id.equals(userObjectId)
    );
    if (index === -1) {
      throw new Error('User is not registered');
    }

    this.attendees.splice(index, 1);
    this.currentAttendees = this.attendees.length;
    return this.save();
  },

  updateStatus: function (this: ScheduleDocument): Promise<ScheduleDocument> {
    const now = new Date();

    if (now < this.startDate) {
      this.status = ScheduleStatus.PENDING;
    } else if (now >= this.startDate && now <= this.endDate) {
      this.status = ScheduleStatus.ONGOING;
    } else {
      this.status = ScheduleStatus.COMPLETED;
    }

    return this.save();
  },

  deleteOne: function (
    this: ScheduleDocument
  ): Promise<ScheduleDocument | null> {
    this.isActive = false;
    this.status = ScheduleStatus.CANCELLED;
    return this.save();
  },
};

// Custom toJSON transform to include virtual fields
ScheduleSchema.set('toJSON', {
  ...baseSchemaOptions.toJSON,
  virtuals: true,
});

// Ensure virtuals are included when converting to JSON
ScheduleSchema.set('toObject', {
  ...baseSchemaOptions.toObject,
  virtuals: true,
});
