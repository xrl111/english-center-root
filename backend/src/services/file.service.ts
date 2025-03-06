import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as sharp from 'sharp';
import * as crypto from 'crypto';
import config from '../config';
import { Express } from 'express';

@Injectable()
export class FileService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = join(process.cwd(), config.upload.destination);
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async validateFile(file: Express.Multer.File): Promise<void> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size
    if (file.size > config.upload.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${
          config.upload.maxFileSize / 1024 / 1024
        }MB`
      );
    }

    // Check file type
    if (!config.upload.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${
          file.mimetype
        } is not supported. Allowed types: ${config.upload.allowedMimeTypes.join(
          ', '
        )}`
      );
    }
  }

  async processImage(
    file: Express.Multer.File,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<{ filename: string; path: string }> {
    const { width, height, quality = 80, format = 'jpeg' } = options;

    await this.validateFile(file);

    // Generate unique filename
    const fileHash = crypto
      .createHash('md5')
      .update(file.originalname + Date.now())
      .digest('hex');
    const filename = `${fileHash}.${format}`;
    const filePath = join(this.uploadDir, filename);

    // Process image with sharp
    let imageProcessor = sharp(file.buffer);

    // Resize if dimensions provided
    if (width || height) {
      imageProcessor = imageProcessor.resize(width, height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      });
    }

    // Set format and quality
    switch (format) {
      case 'jpeg':
        imageProcessor = imageProcessor.jpeg({ quality });
        break;
      case 'png':
        imageProcessor = imageProcessor.png({ quality });
        break;
      case 'webp':
        imageProcessor = imageProcessor.webp({ quality });
        break;
    }

    // Save processed image
    await imageProcessor.toFile(filePath);

    return {
      filename,
      path: filePath,
    };
  }

  async generateThumbnail(
    file: Express.Multer.File,
    options: {
      width?: number;
      height?: number;
      quality?: number;
    } = {}
  ): Promise<{ filename: string; path: string }> {
    const { width = 200, height = 200, quality = 70 } = options;

    return this.processImage(file, {
      width,
      height,
      quality,
      format: 'jpeg',
    });
  }

  getFilePath(filename: string): string {
    return join(this.uploadDir, filename);
  }

  getFileUrl(filename: string): string {
    return `${config.app.apiPrefix}/uploads/${filename}`;
  }

  isImage(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  async getImageMetadata(file: Express.Multer.File): Promise<sharp.Metadata> {
    if (!this.isImage(file.mimetype)) {
      throw new BadRequestException('File is not an image');
    }
    return sharp(file.buffer).metadata();
  }

  async optimizeImage(
    file: Express.Multer.File,
    options: {
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<Buffer> {
    const { quality = 80, format = 'jpeg' } = options;

    if (!this.isImage(file.mimetype)) {
      throw new BadRequestException('File is not an image');
    }

    let imageProcessor = sharp(file.buffer);

    switch (format) {
      case 'jpeg':
        return imageProcessor.jpeg({ quality }).toBuffer();
      case 'png':
        return imageProcessor.png({ quality }).toBuffer();
      case 'webp':
        return imageProcessor.webp({ quality }).toBuffer();
      default:
        throw new BadRequestException(`Unsupported format: ${format}`);
    }
  }

  generateRandomFilename(originalname: string): string {
    const ext = originalname.split('.').pop();
    return `${crypto.randomBytes(16).toString('hex')}.${ext}`;
  }

  sanitizeFilename(filename: string): string {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-')
      .replace(/-+/g, '-');
  }
}
