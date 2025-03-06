export interface MetricConfig {
  name: string;
  help: string;
  labelNames?: string[];
  buckets?: number[];
}

export interface MonitoringConfig {
  prometheus: {
    enabled: boolean;
    endpoint: string;
    defaultLabels: Record<string, string>;
    metrics: {
      httpRequestDurationMs: MetricConfig;
      httpRequestTotal: MetricConfig;
      memoryUsage: MetricConfig;
      cpuUsage: MetricConfig;
    };
  };
  newRelic: {
    enabled: boolean;
    appName: string;
    licenseKey: string | undefined;
    distributed: {
      enabled: boolean;
    };
    logging: {
      level: string;
    };
  };
  sentry: {
    enabled: boolean;
    dsn: string | undefined;
    environment: string | undefined;
    tracesSampleRate: number;
    maxBreadcrumbs: number;
    attachStacktrace: boolean;
    debug: boolean;
    ignoreErrors: string[];
  };
  datadog: {
    enabled: boolean;
    site: string;
    apiKey: string | undefined;
    service: string;
    env: string | undefined;
    version: string | undefined;
    trackSessionAcrossSubdomains: boolean;
    allowedTracingOrigins: string[];
  };
  healthCheck: {
    enabled: boolean;
    endpoint: string;
    interval: number;
    timeout: number;
    checks: {
      memory: {
        threshold: number;
        critical: boolean;
      };
      cpu: {
        threshold: number;
        critical: boolean;
      };
      disk: {
        threshold: number;
        critical: boolean;
      };
    };
  };
  logging: {
    level: string;
    format: string;
    transports: string[];
    filename: string;
    maxFiles: string;
    httpLog: {
      enabled: boolean;
      format: string;
      skip: string[];
    };
  };
  performance: {
    enabled: boolean;
    metrics: Record<string, boolean>;
    reportingEndpoint: string;
    samplingRate: number;
  };
  errorTracking: {
    enabled: boolean;
    ignoredErrors: string[];
    maxErrors: number;
    sampleRate: number;
  };
}

export const monitoringConfig: MonitoringConfig = {
  prometheus: {
    enabled: true,
    endpoint: '/metrics',
    defaultLabels: {
      app: 'english-center-frontend',
      environment: process.env.NODE_ENV || 'development',
    },
    metrics: {
      httpRequestDurationMs: {
        name: 'http_request_duration_ms',
        help: 'Duration of HTTP requests in ms',
        labelNames: ['route', 'method', 'status'],
        buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
      },
      httpRequestTotal: {
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['route', 'method', 'status'],
      },
      memoryUsage: {
        name: 'process_memory_usage_bytes',
        help: 'Memory usage in bytes',
        labelNames: ['type'],
      },
      cpuUsage: {
        name: 'process_cpu_usage_percent',
        help: 'CPU usage percentage',
      },
    },
  },
  newRelic: {
    enabled: process.env.NEW_RELIC_ENABLED === 'true',
    appName: process.env.NEW_RELIC_APP_NAME || 'english-center-frontend',
    licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
    distributed: {
      enabled: true,
    },
    logging: {
      level: 'info',
    },
  },
  sentry: {
    enabled: process.env.SENTRY_ENABLED === 'true',
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    maxBreadcrumbs: 50,
    attachStacktrace: true,
    debug: process.env.NODE_ENV === 'development',
    ignoreErrors: [
      'Network request failed',
      'ChunkLoadError',
      'Loading CSS chunk',
    ],
  },
  datadog: {
    enabled: process.env.DD_ENABLED === 'true',
    site: process.env.DD_SITE || 'datadoghq.com',
    apiKey: process.env.DD_API_KEY,
    service: 'english-center-frontend',
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    trackSessionAcrossSubdomains: true,
    allowedTracingOrigins: [
      'http://localhost:3000',
      'https://example.com',
    ],
  },
  healthCheck: {
    enabled: true,
    endpoint: '/api/health',
    interval: 30000,
    timeout: 5000,
    checks: {
      memory: {
        threshold: 90,
        critical: true,
      },
      cpu: {
        threshold: 80,
        critical: true,
      },
      disk: {
        threshold: 85,
        critical: true,
      },
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    transports: ['console', 'file'],
    filename: 'logs/app-%DATE%.log',
    maxFiles: '14d',
    httpLog: {
      enabled: true,
      format: ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
      skip: ['/health', '/metrics', '/_next/static'],
    },
  },
  performance: {
    enabled: true,
    metrics: {
      fp: true,
      fcp: true,
      lcp: true,
      cls: true,
      fid: true,
      ttfb: true,
    },
    reportingEndpoint: '/api/vitals',
    samplingRate: 0.1,
  },
  errorTracking: {
    enabled: true,
    ignoredErrors: [
      'ResizeObserver loop limit exceeded',
      'Loading chunk failed',
      'Network request failed',
    ],
    maxErrors: 100,
    sampleRate: 0.1,
  },
};

export default monitoringConfig;