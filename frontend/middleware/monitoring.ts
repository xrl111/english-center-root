import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Counter, Histogram } from 'prom-client';
import { monitoringConfig } from '../config/monitoring.config';
import { performance } from 'perf_hooks';

// Initialize Prometheus metrics
const httpRequestDuration = new Histogram({
  name: monitoringConfig.prometheus.metrics.httpRequestDurationMs.name,
  help: monitoringConfig.prometheus.metrics.httpRequestDurationMs.help,
  labelNames: monitoringConfig.prometheus.metrics.httpRequestDurationMs.labelNames,
  buckets: monitoringConfig.prometheus.metrics.httpRequestDurationMs.buckets,
});

const httpRequestsTotal = new Counter({
  name: monitoringConfig.prometheus.metrics.httpRequestTotal.name,
  help: monitoringConfig.prometheus.metrics.httpRequestTotal.help,
  labelNames: monitoringConfig.prometheus.metrics.httpRequestTotal.labelNames,
});

// Performance metrics collection
const performanceMetrics = new Map<string, number>();

// Error tracking
const errorCounts = new Map<string, number>();
const MAX_ERRORS = monitoringConfig.errorTracking.maxErrors;

/**
 * Extract route pattern from request
 */
function getRoutePattern(pathname: string): string {
  // Replace dynamic route parameters with placeholders
  return pathname.replace(/\/\[[^/]+\]/g, '/:param').replace(/\/\[\.\.\.[^/]+\]/g, '/*');
}

/**
 * Record performance metrics
 */
function recordPerformanceMetrics(metric: string, value: number) {
  if (monitoringConfig.performance.metrics[metric]) {
    performanceMetrics.set(metric, value);
  }
}

/**
 * Track errors
 */
function trackError(error: Error) {
  if (!monitoringConfig.errorTracking.enabled) return;

  const errorName = error.name;
  if (monitoringConfig.errorTracking.ignoredErrors.includes(errorName)) return;

  const currentCount = errorCounts.get(errorName) || 0;
  if (currentCount < MAX_ERRORS) {
    errorCounts.set(errorName, currentCount + 1);

    // Report to error tracking services
    if (monitoringConfig.sentry.enabled) {
      // Sentry.captureException(error);
    }
  }
}

/**
 * Monitoring middleware
 */
export async function middleware(request: NextRequest) {
  // Skip monitoring for excluded paths
  const pathname = request.nextUrl.pathname;
  if (monitoringConfig.logging.httpLog.skip.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const startTime = performance.now();
  let response: NextResponse;

  try {
    // Forward the request
    response = NextResponse.next();

    // Record metrics
    const duration = performance.now() - startTime;
    const route = getRoutePattern(pathname);
    const method = request.method;
    const status = response.status;

    // Record HTTP metrics
    httpRequestDuration.observe({ route, method, status }, duration);
    httpRequestsTotal.inc({ route, method, status });

    // Record Web Vitals if available
    const fp = response.headers.get('x-first-paint');
    if (fp) recordPerformanceMetrics('fp', parseInt(fp));

    const fcp = response.headers.get('x-first-contentful-paint');
    if (fcp) recordPerformanceMetrics('fcp', parseInt(fcp));

    const lcp = response.headers.get('x-largest-contentful-paint');
    if (lcp) recordPerformanceMetrics('lcp', parseInt(lcp));

    // Add monitoring headers
    response.headers.set('Server-Timing', `total;dur=${Math.round(duration)}`);
    response.headers.set('X-Response-Time', `${Math.round(duration)}ms`);

    return response;
  } catch (error) {
    // Track error
    trackError(error);

    // Record error metrics
    httpRequestsTotal.inc({
      route: getRoutePattern(pathname),
      method: request.method,
      status: 500,
    });

    // Forward to error handler
    return NextResponse.next();
  } finally {
    // Sample performance data
    if (Math.random() < monitoringConfig.performance.samplingRate) {
      const performanceData = {
        pathname,
        metrics: Object.fromEntries(performanceMetrics),
        timestamp: Date.now(),
      };

      // Send performance data (implement according to your needs)
      fetch(monitoringConfig.performance.reportingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(performanceData),
      }).catch(() => {
        /* Ignore reporting errors */
      });
    }
  }
}

export const config = {
  matcher: '/((?!_next/static|favicon.ico).*)',
};
