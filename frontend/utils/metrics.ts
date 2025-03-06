// Types for Web Vitals metrics
export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: any[];
}

interface MetricLabels {
  metric: string;
  pathname: string;
  rating?: 'good' | 'needs-improvement' | 'poor';
  [key: string]: string | number | undefined;
}

interface MetricValue {
  value: number;
  labels: MetricLabels;
  timestamp: number;
}

class MetricsRegistry {
  private metrics: Map<string, MetricValue[]> = new Map();

  /**
   * Record a metric value with labels
   */
  observe(name: string, value: number, labels: Partial<MetricLabels> & { metric: string }): void {
    const timestamp = Date.now();
    const fullLabels: MetricLabels = {
      ...labels,
      pathname: labels.pathname || window?.location?.pathname || '/',
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)?.push({ value, labels: fullLabels, timestamp });
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): Record<string, MetricValue[]> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Clear all recorded metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Get metrics older than specified age
   */
  getStaleMetrics(maxAgeMs: number): Record<string, MetricValue[]> {
    const now = Date.now();
    const staleMetrics: Record<string, MetricValue[]> = {};

    this.metrics.forEach((values, name) => {
      const staleValues = values.filter(({ timestamp }) => now - timestamp > maxAgeMs);
      if (staleValues.length > 0) {
        staleMetrics[name] = staleValues;
      }
    });

    return staleMetrics;
  }

  /**
   * Remove metrics older than specified age
   */
  removeStaleMetrics(maxAgeMs: number): void {
    const now = Date.now();
    this.metrics.forEach((values, name) => {
      const freshValues = values.filter(({ timestamp }) => now - timestamp <= maxAgeMs);
      if (freshValues.length === 0) {
        this.metrics.delete(name);
      } else {
        this.metrics.set(name, freshValues);
      }
    });
  }
}

// Singleton instance
export const metricsRegistry = new MetricsRegistry();

/**
 * Web Vitals thresholds for rating calculation
 */
const thresholds = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
} as const;

/**
 * Get rating for a metric value
 */
export function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'needs-improvement';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Record Web Vitals metric
 */
export function recordWebVital(metric: WebVitalsMetric, pathname: string): void {
  const rating = getRating(metric.name, metric.value);
  
  metricsRegistry.observe('web_vitals', metric.value, {
    metric: metric.name,
    pathname,
    rating,
    id: metric.id,
    delta: metric.delta.toString(),
  });
}

/**
 * Record performance metric
 */
export function recordPerformanceMetric(
  name: string,
  value: number,
  pathname: string,
  labels: Record<string, string | number> = {}
): void {
  metricsRegistry.observe('performance', value, {
    metric: name,
    pathname,
    ...labels,
  });
}

/**
 * Record error metric
 */
export function recordError(
  error: Error,
  pathname: string,
  labels: Record<string, string | number> = {}
): void {
  metricsRegistry.observe('errors', 1, {
    metric: 'error',
    pathname,
    name: error.name,
    message: error.message,
    ...labels,
  });
}

/**
 * Export metrics in Prometheus format
 */
export function getMetricsOutput(): string {
  const lines: string[] = [];
  const metrics = metricsRegistry.getMetrics();

  // Clean up stale metrics before export
  metricsRegistry.removeStaleMetrics(30 * 60 * 1000); // 30 minutes

  for (const [name, values] of Object.entries(metrics)) {
    // Add metric help
    lines.push(`# HELP ${name} ${name.replace(/_/g, ' ')}`);
    lines.push(`# TYPE ${name} histogram`);

    // Add metric values
    for (const { value, labels } of values) {
      const labelStr = Object.entries(labels)
        .map(([k, v]) => `${k}="${v}"`)
        .join(',');
      lines.push(`${name}${labelStr ? `{${labelStr}}` : ''} ${value}`);
    }
  }

  return lines.join('\n');
}

export default metricsRegistry;