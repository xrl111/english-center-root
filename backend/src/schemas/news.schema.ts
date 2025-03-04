import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsDocument = News & Document;

@Schema({ timestamps: true })
export class News {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: Date, required: true })
  publishDate: Date;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop([String])
  tags: string[];
}

export const NewsSchema = SchemaFactory.createForClass(News);