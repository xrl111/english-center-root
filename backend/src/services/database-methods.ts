import { Model, FilterQuery, UpdateQuery, HydratedDocument } from 'mongoose';
import { BasePopulateOptions, BaseSortOptions } from '../schemas/base.schema';
import { BaseModelFields } from '../interfaces/base-model.interface';

export interface DatabaseMethods {
  findOne<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>,
    options?: {
      populate?: BasePopulateOptions[];
      select?: string;
      lean?: boolean;
    }
  ): Promise<HydratedDocument<T> | null>;

  find<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>,
    options?: {
      populate?: BasePopulateOptions[];
      select?: string;
      sort?: BaseSortOptions;
      limit?: number;
      skip?: number;
      lean?: boolean;
    }
  ): Promise<HydratedDocument<T>[]>;

  create<T extends BaseModelFields>(
    model: Model<T>,
    data: Partial<T>,
    options?: { userId?: string }
  ): Promise<HydratedDocument<T>>;

  update<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: {
      userId?: string;
      new?: boolean;
      runValidators?: boolean;
      populate?: BasePopulateOptions[];
    }
  ): Promise<HydratedDocument<T> | null>;

  delete<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>,
    options?: { permanent?: boolean; userId?: string }
  ): Promise<boolean>;

  restore<T extends BaseModelFields>(
    model: Model<T>,
    filter: FilterQuery<T>,
    options?: { userId?: string }
  ): Promise<boolean>;

  count<T extends BaseModelFields>(
    model: Model<T>, 
    filter?: FilterQuery<T>
  ): Promise<number>;

  exists<T extends BaseModelFields>(
    model: Model<T>, 
    filter: FilterQuery<T>
  ): Promise<boolean>;
}
