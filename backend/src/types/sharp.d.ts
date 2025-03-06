declare module 'sharp' {
  interface Sharp {
    resize(width?: number, height?: number, options?: ResizeOptions): Sharp;
    jpeg(options?: JpegOptions): Sharp;
    png(options?: PngOptions): Sharp;
    webp(options?: WebpOptions): Sharp;
    toFile(path: string): Promise<OutputInfo>;
    toBuffer(): Promise<Buffer>;
    metadata(): Promise<Metadata>;
  }

  interface ResizeOptions {
    width?: number;
    height?: number;
    fit?: keyof FitEnum;
    position?: number | string;
    background?: Color | string;
    kernel?: string;
    withoutEnlargement?: boolean;
    withoutReduction?: boolean;
    fastShrinkOnLoad?: boolean;
  }

  interface JpegOptions {
    quality?: number;
    progressive?: boolean;
    chromaSubsampling?: string;
    optimiseCoding?: boolean;
    optimizeCoding?: boolean;
    mozjpeg?: boolean;
    trellisQuantisation?: boolean;
    trellisQuantization?: boolean;
    overshootDeringing?: boolean;
    optimiseScans?: boolean;
    optimizeScans?: boolean;
    quantisationTable?: number;
    quantizationTable?: number;
    force?: boolean;
  }

  interface PngOptions {
    progressive?: boolean;
    compressionLevel?: number;
    adaptiveFiltering?: boolean;
    force?: boolean;
    quality?: number;
    palette?: boolean;
    colors?: number;
    dither?: number;
  }

  interface WebpOptions {
    quality?: number;
    alphaQuality?: number;
    lossless?: boolean;
    nearLossless?: boolean;
    smartSubsample?: boolean;
    reductionEffort?: number;
    force?: boolean;
  }

  interface OutputInfo {
    format: string;
    size: number;
    width: number;
    height: number;
    channels: number;
    premultiplied: boolean;
    size?: number;
  }

  interface Metadata {
    format?: string;
    size?: number;
    width?: number;
    height?: number;
    space?: string;
    channels?: number;
    depth?: string;
    density?: number;
    chromaSubsampling?: string;
    isProgressive?: boolean;
    hasProfile?: boolean;
    hasAlpha?: boolean;
    orientation?: number;
    exif?: Buffer;
    icc?: Buffer;
    iptc?: Buffer;
    xmp?: Buffer;
  }

  type Color = {
    r?: number;
    g?: number;
    b?: number;
    alpha?: number;
  };

  interface FitEnum {
    contain: 'contain';
    cover: 'cover';
    fill: 'fill';
    inside: 'inside';
    outside: 'outside';
  }

  interface SharpOptions {
    failOnError?: boolean;
    density?: number;
    page?: number;
    pages?: number;
    animated?: boolean;
    limitInputPixels?: number;
    sequentialRead?: boolean;
  }

  interface Sharp extends Promise<Buffer> {
    options(options: SharpOptions): Sharp;
  }

  interface SharpConstructor {
    (input?: string | Buffer, options?: SharpOptions): Sharp;
    (options?: SharpOptions): Sharp;
    cache(isEnabled: boolean): void;
    concurrency(concurrency: number): void;
    counters(): SharpCounters;
    simd(isEnabled: boolean): boolean;
    format: {
      [format: string]: boolean;
    };
  }

  interface SharpCounters {
    queue: number;
    process: number;
  }

  const sharp: SharpConstructor;
  export = sharp;
}