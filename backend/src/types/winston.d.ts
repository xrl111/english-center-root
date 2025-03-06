declare module 'winston' {
  interface LoggerOptions {
    level?: string;
    format?: Logform.Format;
    defaultMeta?: any;
    transports?: Transport[];
    exitOnError?: boolean;
    silent?: boolean;
  }

  interface Logger {
    info(message: any, ...meta: any[]): Logger;
    error(message: any, ...meta: any[]): Logger;
    warn(message: any, ...meta: any[]): Logger;
    debug(message: any, ...meta: any[]): Logger;
    verbose(message: any, ...meta: any[]): Logger;
    log(level: string, message: any, ...meta: any[]): Logger;
  }

  class Transport {
    constructor(options?: TransportOptions);
  }

  interface TransportOptions {
    format?: Logform.Format;
    level?: string;
    silent?: boolean;
    handleExceptions?: boolean;
    handleRejections?: boolean;
  }

  namespace Logform {
    interface Format {
      transform: (info: TransformableInfo) => TransformableInfo | boolean;
    }

    interface TransformableInfo {
      level: string;
      message: string;
      [key: string]: any;
    }

    interface TransformFunction {
      (info: TransformableInfo): TransformableInfo;
    }
  }

  namespace format {
    function combine(...formats: Logform.Format[]): Logform.Format;
    function timestamp(opts?: TimestampOptions): Logform.Format;
    function printf(fn: (info: Logform.TransformableInfo) => string): Logform.Format;
    function colorize(opts?: ColorizeOptions): Logform.Format;
    function json(): Logform.Format;
    function label(opts: LabelOptions): Logform.Format;
    function simple(): Logform.Format;
  }

  interface TimestampOptions {
    format?: string | (() => string);
    alias?: string;
  }

  interface ColorizeOptions {
    level?: boolean;
    message?: boolean;
    all?: boolean;
  }

  interface LabelOptions {
    label: string;
    message?: boolean;
  }

  namespace transports {
    class Console extends Transport {
      constructor(options?: ConsoleTransportOptions);
    }

    class DailyRotateFile extends Transport {
      constructor(options?: DailyRotateFileTransportOptions);
    }

    class File extends Transport {
      constructor(options?: FileTransportOptions);
    }

    interface ConsoleTransportOptions extends TransportOptions {
      stderrLevels?: string[];
      consoleWarnLevels?: string[];
    }

    interface FileTransportOptions extends TransportOptions {
      filename: string;
      maxsize?: number;
      maxFiles?: number;
      tailable?: boolean;
      zippedArchive?: boolean;
    }
  }

  function createLogger(options: LoggerOptions): Logger;
}

declare module 'winston-daily-rotate-file' {
  import { Transport, TransportOptions } from 'winston';

  interface DailyRotateFileTransportOptions extends TransportOptions {
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
  }

  class DailyRotateFile extends Transport {
    constructor(options: DailyRotateFileTransportOptions);
  }

  export = DailyRotateFile;
}