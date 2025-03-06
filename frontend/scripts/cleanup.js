const fs = require('fs');
const path = require('path');
const { safeRemoveFile } = require('../utils/fileUtils');

// Files to be removed
const filesToRemove = [
  path.join(__dirname, '..', 'pages', 'news.js'),
  path.join(__dirname, '..', 'pages', 'admin', 'news.js')
];

// Remove duplicate files
console.log('Starting cleanup of duplicate files...');

filesToRemove.forEach(file => {
  if (safeRemoveFile(file)) {
    console.log(`✓ Successfully removed: ${path.relative(process.cwd(), file)}`);
  } else {
    console.log(`○ File not found or already removed: ${path.relative(process.cwd(), file)}`);
  }
});

// Update package.json scripts
const packageJsonPath = path.join(__dirname, '..', 'package.json');

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add cleanup script
  if (!packageJson.scripts.cleanup) {
    packageJson.scripts.cleanup = 'node scripts/cleanup.js';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✓ Added cleanup script to package.json');
  }

  console.log('\nCleanup completed successfully!');
  console.log('\nYou can run cleanup again using:');
  console.log('npm run cleanup');
} catch (error) {
  console.error('Error updating package.json:', error);
}