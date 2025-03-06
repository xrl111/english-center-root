const fs = require('fs');
const path = require('path');
const { UPLOAD_DIRS } = require('../config/public-assets');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const UPLOADS_BASE = path.join(PUBLIC_DIR, 'uploads');

// Create directories recursively
function mkdirRecursive(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${path.relative(process.cwd(), dir)}`);
  }
}

// Create .gitkeep file with description
function createGitKeep(dir, description) {
  const gitkeepPath = path.join(dir, '.gitkeep');
  const content = `# ${description}\n# Directory content is ignored by git\n`;
  
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, content);
    console.log(`✓ Created .gitkeep in: ${path.relative(process.cwd(), dir)}`);
  }
}

// Main setup function
function setupUploadDirectories() {
  console.log('Setting up upload directories...\n');

  // Create base uploads directory
  mkdirRecursive(UPLOADS_BASE);
  createGitKeep(UPLOADS_BASE, 'Base uploads directory');

  // Create directories for each upload type
  Object.entries(UPLOAD_DIRS).forEach(([type, config]) => {
    const typeDir = path.join(PUBLIC_DIR, config.path);
    mkdirRecursive(typeDir);
    createGitKeep(typeDir, `Directory for ${type.toLowerCase()} uploads`);

    // Create subdirectories
    config.subDirs.forEach(subDir => {
      const subDirPath = path.join(typeDir, subDir);
      mkdirRecursive(subDirPath);
      createGitKeep(subDirPath, `Directory for ${type.toLowerCase()} ${subDir}`);
    });
  });

  // Create directories for static assets
  const staticDirs = [
    'images',
    'images/placeholders',
    'images/icons',
    'images/backgrounds',
  ];

  staticDirs.forEach(dir => {
    const dirPath = path.join(PUBLIC_DIR, dir);
    mkdirRecursive(dirPath);
    createGitKeep(dirPath, `Static ${dir} assets`);
  });

  console.log('\nUpload directories setup completed successfully!');
  console.log('\nDirectory structure created:');
  console.log('public/');
  console.log('  ├── uploads/');
  Object.entries(UPLOAD_DIRS).forEach(([type, config]) => {
    console.log(`  │   ├── ${type.toLowerCase()}/`);
    config.subDirs.forEach(subDir => {
      console.log(`  │   │   ├── ${subDir}/`);
    });
  });
  console.log('  ├── images/');
  console.log('  │   ├── placeholders/');
  console.log('  │   ├── icons/');
  console.log('  │   └── backgrounds/');
}

// Run setup
try {
  setupUploadDirectories();
} catch (error) {
  console.error('Error setting up upload directories:', error);
  process.exit(1);
}