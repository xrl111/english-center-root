/**
 * Configuration for public assets and uploads
 */

const UPLOAD_DIRS = {
  // Course-related uploads
  COURSES: {
    path: '/uploads/courses',
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
    subDirs: ['thumbnails', 'materials', 'resources']
  },
  
  // News-related uploads
  NEWS: {
    path: '/uploads/news',
    allowedTypes: ['image/jpeg', 'image/png'],
    maxSize: 2 * 1024 * 1024, // 2MB
    subDirs: ['thumbnails', 'gallery']
  },
  
  // User-related uploads
  USERS: {
    path: '/uploads/users',
    allowedTypes: ['image/jpeg', 'image/png'],
    maxSize: 1 * 1024 * 1024, // 1MB
    subDirs: ['avatars', 'documents']
  },

  // General uploads
  GENERAL: {
    path: '/uploads/general',
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    subDirs: ['temp', 'misc']
  }
};

const ASSET_PATHS = {
  images: {
    logo: '/images/logo.svg',
    favicon: '/favicon.ico',
    defaultAvatar: '/images/default-avatar.png',
    defaultCourseThumbnail: '/images/default-course.jpg',
    defaultNewsImage: '/images/default-news.jpg',
    noData: '/images/no-data.svg',
    error404: '/images/404.svg',
    error500: '/images/500.svg',
  },
  placeholders: {
    userAvatar: '/images/placeholders/user-avatar.png',
    courseThumbnail: '/images/placeholders/course-thumbnail.jpg',
    newsImage: '/images/placeholders/news-image.jpg',
  }
};

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB global limit
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const IMAGE_SIZES = {
  thumbnail: {
    width: 200,
    height: 200,
    quality: 80
  },
  medium: {
    width: 600,
    height: 400,
    quality: 85
  },
  large: {
    width: 1200,
    height: 800,
    quality: 90
  }
};

module.exports = {
  UPLOAD_DIRS,
  ASSET_PATHS,
  MAX_UPLOAD_SIZE,
  ALLOWED_FILE_TYPES,
  IMAGE_SIZES,
  getUploadPath: (type, subDir = '') => {
    const config = UPLOAD_DIRS[type.toUpperCase()];
    if (!config) throw new Error(`Invalid upload type: ${type}`);
    return `${config.path}/${subDir}`.replace(/\/+/g, '/');
  },
  isAllowedFileType: (type, fileType) => {
    const config = UPLOAD_DIRS[type.toUpperCase()];
    if (!config) return false;
    return config.allowedTypes.includes(fileType);
  },
  getMaxUploadSize: (type) => {
    const config = UPLOAD_DIRS[type.toUpperCase()];
    return config ? config.maxSize : MAX_UPLOAD_SIZE;
  }
};