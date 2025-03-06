import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
import { DatabaseService } from '../../services/database.service';
import { AppLogger } from '../../services/logger.service';

interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly databaseService: DatabaseService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext('UsersService');
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, username } = createUserDto;

    // Check for existing user with same email or username
    const existingUser = await this.userModel.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      throw new ConflictException(`User with this ${field} already exists`);
    }

    try {
      const user = new this.userModel(createUserDto);
      const savedUser = await user.save();
      return savedUser.toObject();
    } catch (error) {
      this.logger.error('Failed to create user', error);
      throw error;
    }
  }

  async findAll(query: UserQueryDto): Promise<PaginatedUsers> {
    const {
      search,
      role,
      isActive,
      isEmailVerified,
      createdAfter,
      createdBefore,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { email: new RegExp(search, 'i') },
        { username: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
      ];
    }

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;
    if (isEmailVerified !== undefined) filter.isEmailVerified = isEmailVerified;

    if (createdAfter || createdBefore) {
      filter.createdAt = {};
      if (createdAfter) filter.createdAt.$gte = new Date(createdAfter);
      if (createdBefore) filter.createdAt.$lte = new Date(createdBefore);
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, SortOrder> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    try {
      const [users, total] = await Promise.all([
        this.userModel
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select('-password')
          .lean(),
        this.userModel.countDocuments(filter),
      ]);

      return {
        items: users,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Failed to fetch users', error);
      throw error;
    }
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').lean();
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .lean();

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return true;
  }

  async verifyEmail(id: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          isEmailVerified: true,
          emailVerificationToken: undefined,
        },
        { new: true }
      )
      .select('-password')
      .lean();

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    await user.setPassword(newPassword);
    await user.save();
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          isActive: false,
          lockUntil: new Date(Date.now() + 3600000), // Lock for 1 hour
        },
        { new: true }
      )
      .select('-password')
      .lean();

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async activate(id: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          isActive: true,
          lockUntil: undefined,
          loginAttempts: 0,
        },
        { new: true }
      )
      .select('-password')
      .lean();

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async validateCredentials(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return null;
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      await this.processFailedLogin(user);
      return null;
    }

    if (user.isLocked) {
      return null;
    }

    await this.processSuccessfulLogin(user);
    return user;
  }

  private async processFailedLogin(user: UserDocument): Promise<void> {
    user.incrementLoginAttempts();
    await user.save();
  }

  private async processSuccessfulLogin(user: UserDocument): Promise<void> {
    user.resetLoginAttempts();
    user.lastLogin = new Date();
    await user.save();
  }
}