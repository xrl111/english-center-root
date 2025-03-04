import { Global, Module } from '@nestjs/common';
import { FileService } from '../../services/file.service';
import { AppLogger } from '../../services/logger.service';

const providers = [
  FileService,
  AppLogger,
];

@Global()
@Module({
  providers: providers,
  exports: providers,
})
export class CommonModule {}