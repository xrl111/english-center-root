/**
 * Monitoring and observability configuration
 */
module.exports = {
  // Prometheus metrics configuration
  prometheus: {
    enabled: true,
    endpoint: '/metrics',
    defaultLabels: {
      app: 'english-center-frontend',
      environment: process.env.NODE_ENV,
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

  // New Relic configuration
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

  // Sentry configuration
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

  // DataDog configuration
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

  // Health check configuration
  healthCheck: {
    enabled: true,
    endpoint: '/api/health',
    interval: 30000, // 30 seconds
    timeout: 5000,   // 5 seconds
    checks: {
      // Define health check thresholds
      memory: {
        threshold: 90, // Percentage
        critical: true,
      },
      cpu: {
        threshold: 80, // Percentage
        critical: true,
      },
      disk: {
        threshold: 85, // Percentage
        critical: true,
      },
    },
  },

  // Logging configuration
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

  // Performance monitoring
  performance: {
    enabled: true,
    metrics: {
      fp: true,     // First Paint
      fcp: true,    // First Contentful Paint
      lcp: true,    // Largest Contentful Paint
      cls: true,    // Cumulative Layout Shift
      fid: true,    // First Input Delay
      ttfb: true,   // Time to First Byte
    },
    reportingEndpoint: '/api/vitals',
    samplingRate: 0.1, // 10% of users
  },

  // Error tracking
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