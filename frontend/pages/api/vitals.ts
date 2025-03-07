import type { NextApiRequest, NextApiResponse } from 'next';
import { monitoringConfig } from '../../config/monitoring.config';
import { recordPerformanceMetric } from '../../utils/metrics';

interface PerformancePayload {
  pathname: string;
  metrics: {
    [key: string]: number;
  };
  timestamp: number;
  connection?: {
    effectiveType?: string;
    rtt?: number;
    downlink?: number;
  };
}

interface VitalsResponse {
  message: string;
  received?: {
    metrics: string[];
    timestamp: string;
  };
  error?: string;
}

/**
 * Validate payload data
 */
function validatePayload(payload: any): payload is PerformancePayload {
  if (!payload || typeof payload !== 'object') return false;
  if (typeof payload.pathname !== 'string') return false;
  if (!payload.metrics || typeof payload.metrics !== 'object') return false;
  if (typeof payload.timestamp !== 'number') return false;
  
  // Validate metrics values
  for (const [, value] of Object.entries(payload.metrics)) {
    if (typeof value !== 'number' || !isFinite(value)) return false;
  }

  return true;
}

/**
 * API endpoint for collecting web vitals and performance metrics
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VitalsResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      message: 'Method Not Allowed',
      error: `The ${req.method} method is not supported` 
    });
  }

  // Check if performance monitoring is enabled
  if (!monitoringConfig.performance.enabled) {
    return res.status(503).json({ 
      message: 'Performance monitoring is disabled' 
    });
  }

  // Apply sampling rate
  if (Math.random() > monitoringConfig.performance.samplingRate) {
    return res.status(202).json({ 
      message: 'Metric not sampled' 
    });
  }

  try {
    // Validate payload
    const payload = req.body;
    if (!validatePayload(payload)) {
      return res.status(400).json({ 
        message: 'Invalid payload',
        error: 'The request payload does not match the required format'
      });
    }

    // Record each metric
    const recordedMetrics: string[] = [];
    for (const [name, value] of Object.entries(payload.metrics)) {
      try {
        const labels: Record<string, string | number> = {
          userAgent: req.headers['user-agent'] || 'unknown'
        };

        if (payload.connection?.effectiveType) {
          labels.effectiveType = payload.connection.effectiveType;
        }
        if (payload.connection?.rtt) {
          labels.rtt = payload.connection.rtt;
        }
        if (payload.connection?.downlink) {
          labels.downlink = payload.connection.downlink;
        }

        recordPerformanceMetric(
          name,
          value,
          payload.pathname,
          labels
        );
        recordedMetrics.push(name);
      } catch (error) {
        console.warn(`Failed to record metric ${name}:`, error);
      }
    }

    // Return success response
    return res.status(202).json({
      message: 'Metrics recorded successfully',
      received: {
        metrics: recordedMetrics,
        timestamp: new Date(payload.timestamp).toISOString(),
      },
    });
  } catch (error) {
    console.error('Error processing performance metrics:', error);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: 'Failed to process performance metrics'
    });
  }
}

// Configure request size limits
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '16kb',
    },
  },
};