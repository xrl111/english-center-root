import { User } from '../modules/users/schemas/user.schema';

declare global {
  namespace Express {
    export interface Multer {
      /** Object containing file metadata and buffer */
      file: {
        /** Name of the form field associated with this file */
        fieldname: string;
        /** Name of the file on the uploader's computer */
        originalname: string;
        /** Value of the `Content-Type` header for this file */
        mimetype: string;
        /** Size of the file in bytes */
        size: number;
        /** `DiskStorage` or `MemoryStorage` */
        buffer: Buffer;
      };
    }

    export interface Request {
      user?: User;
    }
  }
}