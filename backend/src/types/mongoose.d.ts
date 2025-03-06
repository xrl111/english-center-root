import { Document, ObjectId } from 'mongoose';

declare module 'mongoose' {
  interface ObjectId {
    equals(otherId: string | ObjectId | undefined): boolean;
    toString(): string;
    toHexString(): string;
  }

  // Add timestamps to all documents
  interface Document {
    createdAt: Date;
    updatedAt: Date;
  }

  // Add support for lean queries with virtuals
  interface QueryOptions {
    lean?: boolean | { virtuals?: boolean };
  }

  // Add support for virtuals in SchemaOptions
  interface SchemaOptions {
    virtuals?: boolean;
    timestamps?: boolean;
    toJSON?: {
      virtuals?: boolean;
      transform?: (doc: any, ret: any, options: any) => any;
    };
    toObject?: {
      virtuals?: boolean;
      transform?: (doc: any, ret: any, options: any) => any;
    };
  }

  // Add support for schema statics with correct types
  interface SchemaStatics {
    [key: string]: any;
  }

  // Add support for schema methods with correct types
  interface SchemaMethods {
    [key: string]: any;
  }

  // Add support for schema virtuals with correct types
  interface SchemaVirtuals {
    [key: string]: any;
  }

  // Add support for schema instance methods with correct types
  interface DocumentToObjectOptions {
    virtuals?: boolean;
    transform?: (doc: any, ret: any, options: any) => any;
  }

  // Add support for population with virtuals
  interface PopulateOptions {
    path: string;
    select?: string | object;
    model?: string | Model<any>;
    match?: object;
    options?: object;
    populate?: string | PopulateOptions | Array<PopulateOptions>;
    justOne?: boolean;
    lean?: boolean;
    virtual?: boolean;
  }
}

// Helper types for schema methods and virtuals
export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface WithTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface WithVirtuals {
  id: string;
  [key: string]: any;
}

export type DocumentWithTimestamps<T> = T & WithTimestamps;
export type DocumentWithVirtuals<T> = T & WithVirtuals;
export type FullDocument<T> = DocumentWithTimestamps<DocumentWithVirtuals<T>>;

// Helper type for converting string IDs to ObjectId
export type WithObjectId<T> = {
  [P in keyof T]: T[P] extends string | undefined
    ? ObjectId
    : T[P] extends string[]
    ? ObjectId[]
    : T[P];
};