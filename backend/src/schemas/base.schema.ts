import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface BaseDocumentFields {
  readonly _id: Types.ObjectId;
  readonly id: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  isActive: boolean;
}

@Schema({ timestamps: true })
export class BaseSchema implements Omit<BaseDocumentFields, '_id' | 'id'> {
  @Prop({ type: Types.ObjectId, auto: true })
  _id!: Types.ObjectId;

  @Prop({ type: String, virtual: true })
  id!: string;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt!: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export type BaseDocument = Document & BaseDocumentFields;

export const baseSchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc: unknown, ret: Record<string, any>) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_doc: unknown, ret: Record<string, any>) => {
      ret.id = ret._id?.toString();
      return ret;
    },
  },
};

export interface BasePopulateOptions {
  path: string;
  select?: string;
  model?: string;
  match?: Record<string, any>;
  options?: Record<string, any>;
  populate?: BasePopulateOptions[];
}

export interface BaseSortOptions {
  [key: string]: 1 | -1 | 'asc' | 'desc';
}

export interface BaseServiceOptions {
  populate?: BasePopulateOptions[];
  select?: string;
  sort?: BaseSortOptions;
  limit?: number;
  skip?: number;
  lean?: boolean;
}

export interface BaseFilterQuery<T> {
  [key: string]: any;
  isDeleted?: boolean;
}

export interface BaseUpdateOptions {
  new?: boolean;
  runValidators?: boolean;
  context?: 'query' | 'model';
  lean?: boolean;
  populate?: BasePopulateOptions[];
}

export function createSchemaForClass(target: new (...args: any[]) => any): {
  timestamps: boolean;
  toJSON: typeof baseSchemaOptions.toJSON;
  toObject: typeof baseSchemaOptions.toObject;
  collection: string;
} {
  return {
    ...baseSchemaOptions,
    collection: target.name.toLowerCase(),
  };
}

export const addBaseSchema = (schema: any): void => {
  schema.add({
    _id: { type: Types.ObjectId, auto: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  });

  schema.virtual('id').get(function (this: Document) {
    return this._id.toHexString();
  });

  schema.set('timestamps', true);
  schema.set('toJSON', baseSchemaOptions.toJSON);
  schema.set('toObject', baseSchemaOptions.toObject);

  // Add common indexes
  schema.index({ createdAt: -1 });
  schema.index({ updatedAt: -1 });
  schema.index({ isDeleted: 1 });
};

// Type guard to check if a value is a Document
export function isDocument(value: any): value is Document {
  return value && typeof value === 'object' && '_id' in value;
}
