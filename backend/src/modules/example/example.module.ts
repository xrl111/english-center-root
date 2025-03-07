import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';
import { Example, ExampleSchema } from './schemas/example.schema';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from '../../services/database.service';
import { AppLogger } from '../../services/logger.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Example.name, schema: ExampleSchema }
    ]),
    AuthModule,
    ConfigModule,
  ],
  controllers: [ExampleController],
  providers: [
    ExampleService,
    DatabaseService,
    AppLogger,
    {
      provide: 'EXAMPLE_MODEL_FEATURES',
      useValue: {
        timestamps: true,
        toJSON: {
          virtuals: true,
          transform: (doc: any, ret: any) => {
            ret.id = ret._id?.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
          },
        },
      },
    },
  ],
  exports: [ExampleService],
})
export class ExampleModule {
  static forRoot() {
    return {
      module: ExampleModule,
      global: true,
    };
  }

  static forFeature() {
    return {
      module: ExampleModule,
      imports: [
        MongooseModule.forFeature([
          { name: Example.name, schema: ExampleSchema }
        ]),
      ],
      exports: [ExampleService],
    };
  }
}

// Export everything needed by other modules
export * from './example.controller';
export * from './example.service';
export * from './schemas/example.schema';
export * from '../auth/guards/auth.guard';
export * from '../auth/guards/roles.guard';
export * from '../auth/decorators/roles.decorator';
export * from '../auth/types/user-role.enum';