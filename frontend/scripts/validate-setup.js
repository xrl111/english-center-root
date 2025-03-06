const fs = require('fs');
const path = require('path');
const { UPLOAD_DIRS, ASSET_PATHS } = require('../config/public-assets');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const REQUIRED_FILES = {
  env: '../.env.local',
  next: '../next.config.js',
  assets: '../config/public-assets.js',
  gitignore: '../.gitignore'
};

function validateDirectory(dir, description) {
  const exists = fs.existsSync(dir);
  const isDir = exists && fs.statSync(dir).isDirectory();
  const hasGitKeep = exists && fs.existsSync(path.join(dir, '.gitkeep'));
  
  return {
    path: path.relative(process.cwd(), dir),
    description,
    exists,
    isDir,
    hasGitKeep,
    isValid: exists && isDir && hasGitKeep
  };
}

function validateRequiredFile(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  
  return {
    path: path.relative(process.cwd(), fullPath),
    description,
    exists,
    isValid: exists
  };
}

function validateSetup() {
  console.log('Validating project setup...\n');
  let isValid = true;
  const issues = [];

  // Validate required files
  console.log('Checking required files:');
  Object.entries(REQUIRED_FILES).forEach(([key, filePath]) => {
    const result = validateRequiredFile(filePath, `Required ${key} file`);
    if (!result.isValid) {
      isValid = false;
      issues.push(`Missing required file: ${result.path}`);
    }
    console.log(`${result.isValid ? '✓' : '✗'} ${result.path}`);
  });

  // Validate upload directories
  console.log('\nChecking upload directories:');
  Object.entries(UPLOAD_DIRS).forEach(([type, config]) => {
    const typeDir = path.join(PUBLIC_DIR, config.path);
    const result = validateDirectory(typeDir, `${type} upload directory`);
    
    if (!result.isValid) {
      isValid = false;
      issues.push(`Invalid directory setup: ${result.path}`);
    }
    console.log(`${result.isValid ? '✓' : '✗'} ${result.path}`);

    // Check subdirectories
    config.subDirs.forEach(subDir => {
      const subDirPath = path.join(typeDir, subDir);
      const subResult = validateDirectory(subDirPath, `${type} ${subDir} subdirectory`);
      
      if (!subResult.isValid) {
        isValid = false;
        issues.push(`Invalid subdirectory setup: ${subResult.path}`);
      }
      console.log(`  ${subResult.isValid ? '✓' : '✗'} ${subResult.path}`);
    });
  });

  // Validate asset paths
  console.log('\nChecking static assets:');
  const validateAssetPaths = (obj, prefix = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object') {
        validateAssetPaths(value, `${prefix}${key}.`);
      } else {
        const assetPath = path.join(PUBLIC_DIR, value);
        const exists = fs.existsSync(assetPath);
        if (!exists) {
          isValid = false;
          issues.push(`Missing static asset: ${path.relative(process.cwd(), assetPath)}`);
        }
        console.log(`${exists ? '✓' : '✗'} ${prefix}${key}: ${value}`);
      }
    });
  };
  validateAssetPaths(ASSET_PATHS);

  // Report results
  console.log('\nValidation Results:');
  if (isValid) {
    console.log('✓ Project setup is valid!');
  } else {
    console.log('✗ Project setup has issues:');
    issues.forEach(issue => console.log(`  - ${issue}`));
    process.exit(1);
  }
}

// Run validation
try {
  validateSetup();
} catch (error) {
  console.error('Error during validation:', error);
  process.exit(1);
}