import { Schema as MongooseSchema } from 'mongoose';

export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseSchemaOptions {
  timestamps: boolean;
}

export const baseSchemaOptions: BaseSchemaOptions = {
  timestamps: true,
};