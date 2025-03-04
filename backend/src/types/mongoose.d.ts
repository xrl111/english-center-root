import { Document, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Course } from '../schemas/course.schema';

declare module 'mongoose' {
  // Add type checking for ObjectId methods
  interface ObjectId {
    equals(other: ObjectId | string): boolean;
  }

  // Interface for Documents with ObjectId
  interface BaseDocument extends Document {
    _id: Types.ObjectId;
  }

  // Type for populated fields
  type PopulatedDoc<T> = T | Types.ObjectId;

  // Type for User Document
  interface UserDocument extends User, BaseDocument {
    _id: Types.ObjectId;
  }

  // Type for Course Document
  interface CourseDocument extends Course, BaseDocument {
    _id: Types.ObjectId;
    instructor: PopulatedDoc<UserDocument>;
    students: PopulatedDoc<UserDocument>[];
  }
}

// Helper type for document arrays
export type DocumentArray<T> = T[] & {
  [index: number]: T & BaseDocument;
};

// Helper type for populated fields
export type Populated<M, K extends keyof M> = Omit<M, K> & {
  [P in K]: M[P] extends Types.ObjectId[] ? Document[] : Document;
};