import { Document, Types, HydratedDocument } from 'mongoose';

export interface BaseModelFields {
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  deletedAt?: Date;
}

export type BaseModel = HydratedDocument<BaseModelFields>;