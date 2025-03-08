import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from './base.schema';

export type NewsDocument = News & Document;

@Schema(baseSchemaOptions)
export class News extends BaseSchema {
  @Prop({ required: true, index: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true, index: true })
  category!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop()
  imageUrl?: string;

  @Prop({ required: true, default: false })
  isPublished!: boolean;

  @Prop({ type: Date, required: true })
  publishDate!: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author!: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  viewCount!: number;
}

export const NewsSchema = SchemaFactory.createForClass(News);

// Add text search index
NewsSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text',
});

// Virtual for checking if news is published and scheduled for current time
NewsSchema.virtual('isCurrentlyPublished').get(function (this: NewsDocument) {
  return this.isPublished && new Date() >= this.publishDate;
});

// Method to publish news
NewsSchema.methods.publish = function (this: NewsDocument) {
  this.isPublished = true;
  this.publishDate = new Date();
  return this.save();
};

// Method to unpublish news
NewsSchema.methods.unpublish = function (this: NewsDocument) {
  this.isPublished = false;
  return this.save();
};

// Increment view count
NewsSchema.methods.incrementViews = function (this: NewsDocument) {
  this.viewCount += 1;
  return this.save();
};

// Custom toJSON transform to include virtual fields
NewsSchema.set('toJSON', {
  ...baseSchemaOptions.toJSON,
  virtuals: true,
});
