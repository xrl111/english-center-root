import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';
import type { WebVitalsMetric } from '../utils/metrics';
import { recordWebVital } from '../utils/metrics';
import { monitoringConfig } from '../config/monitoring.config';

const vitalsUrl = '/api/vitals';

/**
 * Send metrics to analytics endpoint
 */
async function sendToAnalytics(metric: WebVitalsMetric, pathname: string) {
  const body = {
    pathname,
    metrics: {
      [metric.name]: metric.value,
    },
    timestamp: Date.now(),
  };

  // Use Navigator's sendBeacon if available
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
    if (navigator.sendBeacon(vitalsUrl, blob)) {
      return;
    }
  }

  // Fall back to fetch
  try {
    await fetch(vitalsUrl, {
      body: JSON.stringify(body),
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to send web vitals:', error);
  }
}

/**
 * Hook to collect and report Web Vitals metrics
 */
export function useWebVitals() {
  const router = useRouter();

  useEffect(() => {
    if (!monitoringConfig.performance.enabled) {
      return;
    }

    // Get the pathname without query parameters
    const pathname = router.asPath.split('?')[0];

    const handleMetric = (metric: WebVitalsMetric) => {
      // Record metric locally
      recordWebVital(metric, pathname);

      // Send to analytics endpoint
      if (Math.random() < monitoringConfig.performance.samplingRate) {
        sendToAnalytics(metric, pathname);
      }
    };

    // Register web vitals collectors
    if (monitoringConfig.performance.metrics.cls) {
      onCLS(handleMetric);
    }
    if (monitoringConfig.performance.metrics.fcp) {
      onFCP(handleMetric);
    }
    if (monitoringConfig.performance.metrics.fid) {
      onFID(handleMetric);
    }
    if (monitoringConfig.performance.metrics.lcp) {
      onLCP(handleMetric);
    }
    if (monitoringConfig.performance.metrics.ttfb) {
      onTTFB(handleMetric);
    }

    // Additional performance metrics
    if ('performance' in window) {
      // Navigation Timing
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const metric = entry as PerformanceNavigationTiming;
          recordWebVital(
            {
              name: 'TTFB',
              value: metric.responseStart - metric.requestStart,
              delta: 0,
              id: 'nav-timing',
              entries: [entry],
              rating: 'needs-improvement',
            },
            pathname
          );
        });
      });

      observer.observe({ entryTypes: ['navigation'] });

      return () => observer.disconnect();
    }
  }, [router.asPath]);
}

export default useWebVitals;