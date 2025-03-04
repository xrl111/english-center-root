declare module 'multer' {
  import { Request } from 'express';

  interface File {
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

  interface StorageEngine {
    _handleFile: (
      req: Request,
      file: File,
      callback: (error?: Error | null, info?: Partial<File>) => void
    ) => void;
    _removeFile: (
      req: Request,
      file: File,
      callback: (error?: Error | null) => void
    ) => void;
  }

  interface Options {
    /** The destination directory for uploaded files */
    dest?: string;
    /** The storage engine to use for uploaded files */
    storage?: StorageEngine;
    /** Function to control which files are uploaded */
    fileFilter?: (
      req: Request,
      file: File,
      callback: (error: Error | null, acceptFile: boolean) => void
    ) => void;
    /** Limits of the uploaded data */
    limits?: {
      /** Max field name size (in bytes) */
      fieldNameSize?: number;
      /** Max field value size (in bytes) */
      fieldSize?: number;
      /** Max number of non-file fields */
      fields?: number;
      /** For multipart forms, the max file size (in bytes) */
      fileSize?: number;
      /** For multipart forms, the max number of file fields */
      files?: number;
      /** For multipart forms, the max number of parts (fields + files) */
      parts?: number;
      /** For multipart forms, the max number of header key=>value pairs to parse */
      headerPairs?: number;
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      file: Multer.File;
      files?: { [fieldname: string]: Multer.File[] } | Multer.File[];
    }
  }

  namespace Multer {
    interface File {
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
  }
}

export = multer;