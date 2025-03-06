/**
 * Deployment configuration for different environments
 */
module.exports = {
  production: {
    host: 'production.example.com',
    user: 'deploy',
    path: '/var/www/english-center',
    cluster: 'english-center-prod',
    pm2: {
      name: 'english-center-frontend',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '1G',
    },
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      API_URL: 'https://api.example.com',
      UPLOAD_URL: 'https://uploads.example.com',
    },
    ssl: {
      enabled: true,
      cert: '/etc/letsencrypt/live/example.com/fullchain.pem',
      key: '/etc/letsencrypt/live/example.com/privkey.pem',
    },
    backup: {
      enabled: true,
      path: '/var/backups/english-center',
      retain: 7, // days
    },
    healthCheck: {
      url: 'https://example.com/health',
      timeout: 30000,
      retries: 3,
    },
  },

  staging: {
    host: 'staging.example.com',
    user: 'deploy',
    path: '/var/www/english-center-staging',
    cluster: 'english-center-staging',
    pm2: {
      name: 'english-center-frontend-staging',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
    },
    env: {
      NODE_ENV: 'staging',
      PORT: 3000,
      API_URL: 'https://api.staging.example.com',
      UPLOAD_URL: 'https://uploads.staging.example.com',
    },
    ssl: {
      enabled: true,
      cert: '/etc/letsencrypt/live/staging.example.com/fullchain.pem',
      key: '/etc/letsencrypt/live/staging.example.com/privkey.pem',
    },
    backup: {
      enabled: true,
      path: '/var/backups/english-center-staging',
      retain: 3, // days
    },
    healthCheck: {
      url: 'https://staging.example.com/health',
      timeout: 30000,
      retries: 3,
    },
  },

  development: {
    host: 'localhost',
    user: process.env.USER,
    path: '/var/www/english-center-dev',
    cluster: 'english-center-dev',
    pm2: {
      name: 'english-center-frontend-dev',
      instances: 1,
      exec_mode: 'fork',
      watch: true,
      ignore_watch: ['node_modules', '.git', 'public'],
    },
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      API_URL: 'http://localhost:3001',
      UPLOAD_URL: 'http://localhost:3001/uploads',
    },
    ssl: {
      enabled: false,
    },
    backup: {
      enabled: false,
    },
    healthCheck: {
      url: 'http://localhost:3000/health',
      timeout: 5000,
      retries: 1,
    },
  },

  // Shared configuration across all environments
  shared: {
    deployTimeout: 300000, // 5 minutes
    keepReleases: 5,
    restartWait: 10000,
    hooks: {
      beforeDeploy: [
        'npm run build',
        'npm run test',
      ],
      afterDeploy: [
        'npm run cache:clear',
        'npm run sitemap:generate',
      ],
    },
    excludes: [
      '.git',
      'node_modules',
      'test',
      'tests',
      'coverage',
      '.env*',
      '*.log',
      'docs',
    ],
    symlinks: [
      {
        source: '/var/www/shared/uploads',
        target: 'public/uploads',
      },
      {
        source: '/var/www/shared/.env.production',
        target: '.env.production',
      },
    ],
  },
};