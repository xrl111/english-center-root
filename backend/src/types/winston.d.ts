declare module 'winston' {
  interface LoggerOptions {
    level?: string;
    format?: winston.Logform.Format;
    defaultMeta?: any;
    transports?: winston.transport[];
    exitOnError?: boolean;
    silent?: boolean;
  }

  interface Logger {
    info(message: string, ...meta: any[]): Logger;
    error(message: string, ...meta: any[]): Logger;
    warn(message: string, ...meta: any[]): Logger;
    debug(message: string, ...meta: any[]): Logger;
    verbose(message: string, ...meta: any[]): Logger;
    log(level: string, message: string, ...meta: any[]): Logger;
  }

  namespace winston {
    interface transport {}

    interface transports {
      Console: any;
      DailyRotateFile: any;
      File: any;
      Http: any;
      Stream: any;
      new(): transport;
    }

    namespace Logform {
      interface Format {
        transform: (info: any) => any;
        options?: any;
      }

      interface TransformableInfo {
        level: string;
        message: string;
        [key: string]: any;
      }
    }

    function createLogger(options: LoggerOptions): Logger;
    function format(...args: any[]): Logform.Format;
    function addColors(colors: any): any;
  }

  export = winston;
}

declare module 'winston-daily-rotate-file' {
  import { transport } from 'winston';

  interface DailyRotateFileTransportOptions {
    filename: string;
    datePattern?: string;
    zippedArchive?: boolean;
    maxSize?: string;
    maxFiles?: string;
    dirname?: string;
    auditFile?: string;
    frequency?: string;
    utc?: boolean;
    extension?: string;
    createSymlink?: boolean;
    symlinkName?: string;
    level?: string;
    format?: any;
    json?: boolean;
    eol?: string;
    tailable?: boolean;
    [key: string]: any;
  }

  class DailyRotateFile extends transport {
    constructor(options: DailyRotateFileTransportOptions);
  }

  export = DailyRotateFile;
}