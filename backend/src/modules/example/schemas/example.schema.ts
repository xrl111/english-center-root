import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import {
  BaseSchema,
  BaseDocument,
  createSchemaForClass,
} from '../../../schemas/base.schema';

export interface IExample extends BaseDocument {
  name: string;
  description: string;
  isActive: boolean;
}

export interface IExampleVirtuals {
  displayName: string;
}

export interface ExampleInstanceMethods {
  toggleActive(): Promise<ExampleDocument>;
}

export interface ExampleStaticMethods {
  findByName(name: string): Promise<ExampleDocument | null>;
  findActive(): Promise<ExampleDocument[]>;
}

export type ExampleDocument = Example &
  Document &
  IExampleVirtuals &
  ExampleInstanceMethods & { _id: Types.ObjectId };

@Schema(createSchemaForClass(Example))
export class Example
  extends BaseSchema
  implements Omit<IExample, keyof Document | keyof BaseSchema>
{
  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ required: true, type: String })
  description!: string;

  @Prop({ default: true, type: Boolean })
  isActive!: boolean;
}

export const ExampleSchema = SchemaFactory.createForClass(Example);

// Add indexes
ExampleSchema.index({ name: 1 });
ExampleSchema.index({ isActive: 1 });
ExampleSchema.index({ createdAt: -1 });

// Add virtual fields
ExampleSchema.virtual('displayName').get(function (this: ExampleDocument) {
  return `${this.name} (${this.isActive ? 'Active' : 'Inactive'})`;
});

// Add instance methods
ExampleSchema.methods.toggleActive = function (
  this: ExampleDocument
): Promise<ExampleDocument> {
  this.isActive = !this.isActive;
  return this.save();
};

// Add static methods
ExampleSchema.statics.findByName = function (name: string) {
  return this.findOne({ name: new RegExp(name, 'i') }).exec();
};

ExampleSchema.statics.findActive = function () {
  return this.find({ isActive: true }).exec();
};

// Middleware
ExampleSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  next();
});

ExampleSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate() as any;
  if (update.name) {
    update.name = update.name.trim();
  }
});

// Export model type that includes both static and instance methods
export interface ExampleModel
  extends Model<ExampleDocument, {}, ExampleInstanceMethods>,
    ExampleStaticMethods {}

// Export types for the service layer
export interface CreateExampleInput {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateExampleInput {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ExampleQueryOptions {
  isActive?: boolean;
  name?: string;
  [key: string]: any;
}
