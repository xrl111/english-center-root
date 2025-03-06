import type { NextApiRequest, NextApiResponse } from 'next';
import os from 'os';
import { readFileSync } from 'fs';
import { join } from 'path';

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  memory: {
    free: number;
    total: number;
    used: number;
    usage: number;
  };
  cpu: {
    load: number[];
    cores: number;
  };
  build: {
    number: string;
    commit: string;
    branch: string;
    environment: string;
  };
  checks: {
    database?: boolean;
    cache?: boolean;
    api?: boolean;
  };
}

function getBuildInfo() {
  try {
    return JSON.parse(
      readFileSync(join(process.cwd(), 'public', 'build-info.json'), 'utf-8')
    );
  } catch (error) {
    return {
      version: process.env.npm_package_version || '0.0.0',
      buildNumber: 'unknown',
      gitCommit: 'unknown',
      gitBranch: 'unknown',
      environment: process.env.NODE_ENV,
    };
  }
}

async function checkExternalServices() {
  const checks: HealthResponse['checks'] = {};

  // Check API availability
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
      checks.api = response.ok;
    } catch (error) {
      checks.api = false;
    }
  }

  // Add more service checks as needed
  return checks;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const buildInfo = getBuildInfo();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  const checks = await checkExternalServices();
  const isHealthy = Object.values(checks).every(check => check !== false);

  const healthData: HealthResponse = {
    status: isHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: buildInfo.version,
    memory: {
      total: Math.round(totalMemory / 1024 / 1024),
      free: Math.round(freeMemory / 1024 / 1024),
      used: Math.round(usedMemory / 1024 / 1024),
      usage: Math.round((usedMemory / totalMemory) * 100),
    },
    cpu: {
      load: os.loadavg(),
      cores: os.cpus().length,
    },
    build: {
      number: buildInfo.buildNumber,
      commit: buildInfo.gitCommit,
      branch: buildInfo.gitBranch,
      environment: buildInfo.environment,
    },
    checks,
  };

  // Set cache control headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  // Send response with appropriate status code
  res.status(isHealthy ? 200 : 503).json(healthData);
}