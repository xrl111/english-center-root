import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../auth/types/roles';
import { BaseSchema, baseSchemaOptions } from '../../../schemas/base.schema';

interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  setPassword(newPassword: string): Promise<void>;
  incrementLoginAttempts(): void;
  resetLoginAttempts(): void;
  addRefreshToken(token: string): void;
  removeRefreshToken(token: string): void;
  clearAllRefreshTokens(): void;
  hasPermission(permission: string): boolean;
  addPermission(permission: string): void;
  removePermission(permission: string): void;
}

interface UserVirtuals {
  fullName: string;
  isLocked: boolean;
}

interface TimestampFields {
  createdAt: Date;
  updatedAt: Date;
}

interface BaseFields {
  _id: Types.ObjectId;
  id: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export type UserDocument = User &
  Document &
  UserMethods &
  UserVirtuals &
  TimestampFields &
  BaseFields;

const userSchemaOptions: SchemaOptions = {
  ...baseSchemaOptions,
  timestamps: true,
  collection: 'users',
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, any>) => {
      ret.id = ret._id?.toString();
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.__v;
      delete ret._id;
      return ret;
    },
  },
};

@Schema(userSchemaOptions)
export class User extends BaseSchema {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true, unique: true, trim: true, index: true })
  username!: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.USER, index: true })
  role!: UserRole;

  @Prop({ type: String, required: false })
  firstName?: string;

  @Prop({ type: String, required: false })
  lastName?: string;

  @Prop({ type: String, required: false })
  passwordResetToken?: string;

  @Prop({ type: Date, required: false })
  passwordResetExpires?: Date;

  @Prop({ type: [String], default: [] })
  refreshTokens!: string[];

  @Prop({ type: Date, required: false })
  lastLogin?: Date;

  @Prop({ type: Number, default: 0 })
  loginAttempts!: number;

  @Prop({ type: Date, required: false })
  lockUntil?: Date;

  @Prop({ type: [String], default: [] })
  enrolledCourses!: string[];

  @Prop({ type: [String], default: [] })
  instructingCourses!: string[];

  @Prop({ type: Object, default: {} })
  preferences!: Record<string, any>;

  @Prop({ type: [String], default: [] })
  permissions!: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add virtual fields
UserSchema.virtual('fullName').get(function (this: UserDocument) {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.username;
});

UserSchema.virtual('isLocked').get(function (this: UserDocument) {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

// Add methods
UserSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.setPassword = async function (
  this: UserDocument,
  newPassword: string
): Promise<void> {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(newPassword, salt);
};

UserSchema.methods.incrementLoginAttempts = function (
  this: UserDocument
): void {
  this.loginAttempts += 1;
  if (this.loginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 3600000); // 1 hour
  }
};

UserSchema.methods.resetLoginAttempts = function (this: UserDocument): void {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
};

UserSchema.methods.addRefreshToken = function (
  this: UserDocument,
  token: string
): void {
  this.refreshTokens = [token, ...this.refreshTokens.slice(0, 4)];
};

UserSchema.methods.removeRefreshToken = function (
  this: UserDocument,
  token: string
): void {
  this.refreshTokens = this.refreshTokens.filter((t) => t !== token);
};

UserSchema.methods.clearAllRefreshTokens = function (this: UserDocument): void {
  this.refreshTokens = [];
};

UserSchema.methods.hasPermission = function (
  this: UserDocument,
  permission: string
): boolean {
  return this.permissions.includes(permission);
};

UserSchema.methods.addPermission = function (
  this: UserDocument,
  permission: string
): void {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
};

UserSchema.methods.removePermission = function (
  this: UserDocument,
  permission: string
): void {
  this.permissions = this.permissions.filter((p) => p !== permission);
};

// Add pre-save middleware for password hashing
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Add indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ lastLogin: 1 });
UserSchema.index({ enrolledCourses: 1 });
UserSchema.index({ instructingCourses: 1 });
