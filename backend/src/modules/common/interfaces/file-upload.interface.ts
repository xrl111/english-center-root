import { Request } from 'express';

export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ProcessedFile {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  url: string;
}

export interface ImageProcessingResult {
  original: ProcessedFile;
  thumbnail?: ProcessedFile;
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

export interface FileUploadRequest extends Request {
  file: MulterFile;
  files?: {
    [fieldname: string]: MulterFile[];
  };
}

export interface MulterFile {
  /** Name of the form field associated with this file */
  fieldname: string;
  /** Name of the file on the uploader's computer */
  originalname: string;
  /** Encoding type of the file */
  encoding: string;
  /** Mime type of the file */
  mimetype: string;
  /** Size of the file in bytes */
  size: number;
  /** The folder to which the file has been saved (DiskStorage) */
  destination?: string;
  /** The name of the file within the destination (DiskStorage) */
  filename?: string;
  /** Location of the uploaded file (DiskStorage) */
  path?: string;
  /** A Buffer of the entire file (MemoryStorage) */
  buffer?: Buffer;
}

export interface FileMetadata {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  thumbnailUrl?: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    [key: string]: any;
  };
}

export interface FileUploadResult {
  success: boolean;
  file?: FileMetadata;
  error?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ThumbnailOptions extends ImageDimensions {
  quality?: number;
  format?: string;
}

export type FileType = 'image' | 'document' | 'video' | 'audio' | 'other';

export interface FileValidationRules {
  maxSize: number;
  allowedTypes: string[];
  maxFiles?: number;
  minFiles?: number;
  requiredDimensions?: ImageDimensions;
  allowedExtensions?: string[];
}

export interface StorageConfig {
  destination: string;
  filename?: (
    req: Request,
    file: MulterFile,
    cb: (error: Error | null, filename: string) => void
  ) => void;
}

export type FileFilter = (
  req: Request,
  file: MulterFile,
  cb: (error: Error | null, acceptFile: boolean) => void
) => void;
