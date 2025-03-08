import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { Connection } from 'mongoose';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { NewsModule } from './modules/news/news.module';
import { CoursesModule } from './modules/courses/courses.module';
import { SchedulesModule } from './modules/schedules/schedules.module';

import { AppLogger } from './services/logger.service';
import { LoggerModule } from './services/logger.module';
import { DatabaseService } from './services/database.service';
import { GlobalExceptionFilter } from './middleware/error.middleware';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

import { validate } from './config/validation';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      cache: true,
    }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
        connectionFactory: (connection: Connection) => {
          connection.on('connected', () => {
            console.log('MongoDB connected');
          });
          connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),

    // Logger module
    LoggerModule,

    // Feature modules
    UsersModule,
    AuthModule,
    NewsModule,
    CoursesModule,
    SchedulesModule,
  ],
  providers: [
    // Database service
    {
      provide: DatabaseService,
      useFactory: (configService: ConfigService, logger: AppLogger) => {
        return new DatabaseService(configService, logger);
      },
      inject: [ConfigService, AppLogger],
    },

    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },

    // Global logging interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },

    // Required for guards
    Reflector,

    // Global JWT auth guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // Global roles guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
