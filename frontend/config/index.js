const isProd = process.env.NODE_ENV === 'production';

const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    timeout: 30000, // 30 seconds
  },

  // Auth Configuration
  auth: {
    tokenKey: 'token',
    loginPath: '/auth/login',
    logoutPath: '/auth/logout',
    homePath: '/',
    adminPath: '/admin',
  },

  // SEO Configuration
  seo: {
    siteName: 'English Learning Center',
    titleTemplate: '%s | English Learning Center',
    defaultTitle: 'English Learning Center',
    defaultDescription: 'Learn English with professional instructors',
    defaultKeywords: 'english, learning, courses, education',
    defaultOgImage: '/images/og-image.jpg',
  },

  // Theme Configuration
  theme: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
  },

  // File Upload Configuration
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
    allowedFileTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    imageCompression: {
      maxWidth: 1200,
      maxHeight: 800,
      quality: 0.8,
    },
  },

  // Date Configuration
  date: {
    format: {
      default: 'MMM dd, yyyy',
      full: 'MMMM dd, yyyy',
      time: 'HH:mm',
      dateTime: 'MMM dd, yyyy HH:mm',
    },
    timezone: 'Asia/Bangkok',
  },

  // Pagination Configuration
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
  },

  // Feature Flags
  features: {
    enableNotifications: true,
    enableChat: false,
    enableFileUpload: true,
    enableVideoCall: false,
  },

  // Social Media Links
  social: {
    facebook: 'https://facebook.com/englishcenter',
    twitter: 'https://twitter.com/englishcenter',
    instagram: 'https://instagram.com/englishcenter',
    youtube: 'https://youtube.com/englishcenter',
  },

  // Contact Information
  contact: {
    email: 'contact@englishcenter.com',
    phone: '+66 2 123 4567',
    address: '123 Learning Street, Education District, Bangkok 10110',
  },

  // Analytics Configuration
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
    enableAnalytics: isProd,
  },

  // Development Tools
  dev: {
    enableDevTools: !isProd,
    logLevel: isProd ? 'error' : 'debug',
    showErrorDetails: !isProd,
  },
};

export default config;