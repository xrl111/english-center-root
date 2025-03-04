import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ContactDto } from './dto/contact.dto';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  healthCheck() {
    return this.appService.healthCheck();
  }

  @Post('contact')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send contact form message' })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async contact(@Body(new ValidationPipe()) contactDto: ContactDto) {
    return this.appService.sendContactMessage(contactDto);
  }
}