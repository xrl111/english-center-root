import { Injectable, Logger } from '@nestjs/common';
import { ContactDto } from './dto/contact.dto';

interface LogMetadata {
  error: string;
  stack?: string;
}

function formatError(error: unknown): LogMetadata {
  if (error instanceof Error) {
    return {
      error: error.message,
      stack: error.stack,
    };
  }
  return { error: String(error) };
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  async sendContactMessage(contactDto: ContactDto) {
    try {
      // Log the contact message (in a real app, you might want to save to DB or send email)
      this.logger.log(
        `Contact message received from ${contactDto.name} (${contactDto.email})`
      );

      // Here you would typically:
      // 1. Save to database
      // 2. Send notification email to admin
      // 3. Send confirmation email to user

      // For now, we'll just simulate a successful message handling
      return {
        success: true,
        message: 'Contact message received successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error processing contact message', formatError(error));
      throw error;
    }
  }
}
