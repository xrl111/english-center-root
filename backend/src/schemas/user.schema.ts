import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { BaseDocument, baseSchemaOptions } from './base.schema';
import { UserRole } from '../modules/auth/types/roles';
import { CallbackError } from 'mongoose';

export type UserDocument = User & Document;

@Schema(baseSchemaOptions)
export class User {
  @Prop({ required: true })
  username!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  })
  role!: UserRole;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Date })
  lastLogin!: Date;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Course' }],
    default: [],
  })
  enrolledCourses!: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Course' }],
    default: [],
  })
  instructingCourses!: MongooseSchema.Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add text index for search functionality
UserSchema.index({ username: 'text', email: 'text' });

// Add compound index for unique email per active user
UserSchema.index({ email: 1, isActive: 1 }, { unique: true });

// Virtual fields
UserSchema.virtual('fullName').get(function (this: UserDocument) {
  return this.username;
});

UserSchema.virtual('isAdmin').get(function (this: UserDocument) {
  return this.role === UserRole.ADMIN;
});

// Configure schema options
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    delete ret.password;
    return ret;
  },
});

UserSchema.set('toObject', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    delete ret.password;
    return ret;
  },
});

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};
