import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AppLogger } from '../../services/logger.service';
import { DatabaseService } from '../../services/database.service';
import { UserRole } from '../auth/types/roles';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/user.dto';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;
          
          // Add any additional schema configuration here
          schema.pre('save', function(next) {
            if (this.isNew) {
              // Set default role if not specified
              if (!this.role) {
                this.role = UserRole.USER;
              }
            }
            next();
          });

          return schema;
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    AppLogger,
    DatabaseService,
    {
      provide: 'INITIAL_ADMIN_CONFIG',
      useFactory: (configService: ConfigService) => ({
        email: configService.get<string>('ADMIN_EMAIL'),
        password: configService.get<string>('ADMIN_PASSWORD'),
        username: configService.get<string>('ADMIN_USERNAME', 'admin'),
      }),
      inject: [ConfigService],
    },
  ],
  exports: [UsersService],
})
export class UsersModule implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext('UsersModule');
  }

  async onModuleInit() {
    await this.createInitialAdminUser();
  }

  private async createInitialAdminUser() {
    try {
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
      const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
      const adminUsername = this.configService.get<string>('ADMIN_USERNAME', 'admin');

      if (!adminEmail || !adminPassword) {
        this.logger.warn('Admin credentials not configured, skipping initial admin creation');
        return;
      }

      const existingAdmin = await this.usersService.findByEmail(adminEmail);
      if (existingAdmin) {
        this.logger.log('Admin user already exists, skipping creation');
        return;
      }

      // Create admin user with proper DTO including all required fields
      const adminCreateDto: CreateUserDto = {
        email: adminEmail,
        password: adminPassword,
        username: adminUsername,
        role: UserRole.ADMIN,
        isEmailVerified: true,
        isActive: true,
      };

      const adminUser = await this.usersService.create(adminCreateDto);

      // Additional permissions or setup if needed
      if (adminUser) {
        this.logger.log(`Initial admin user created: ${adminUser.email}`);
      }
    } catch (error) {
      this.logger.error('Failed to create initial admin user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }
}

// Re-export user-related types and interfaces
export * from './schemas/user.schema';
export * from './dto/user.dto';