const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Get build information including version, git commit, and build time
 */
function getBuildInfo() {
  const packageJson = require('../package.json');
  const now = new Date();
  let gitCommit = 'unknown';
  let gitBranch = 'unknown';

  try {
    gitCommit = execSync('git rev-parse HEAD').toString().trim();
    gitBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  } catch (error) {
    console.warn('Unable to get git information:', error.message);
  }

  const buildInfo = {
    version: packageJson.version,
    buildTime: now.toISOString(),
    gitCommit,
    gitBranch,
    nodeVersion: process.version,
    buildNumber: process.env.BUILD_NUMBER || 'local',
    environment: process.env.NODE_ENV || 'development',
  };

  return buildInfo;
}

/**
 * Write build information to a JSON file
 */
function writeBuildInfo() {
  const buildInfo = getBuildInfo();
  const buildInfoPath = path.join(__dirname, '../public/build-info.json');

  try {
    fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
    console.log('✨ Build info written to:', buildInfoPath);
  } catch (error) {
    console.error('Error writing build info:', error);
    process.exit(1);
  }

  return buildInfo;
}

/**
 * Check if the current version is valid semver
 */
function validateVersion() {
  const packageJson = require('../package.json');
  const semver = require('semver');

  if (!semver.valid(packageJson.version)) {
    console.error('Invalid version in package.json:', packageJson.version);
    process.exit(1);
  }

  return true;
}

/**
 * Get the next version based on the release type
 */
function getNextVersion(releaseType) {
  const packageJson = require('../package.json');
  const semver = require('semver');

  if (!['major', 'minor', 'patch', 'prerelease'].includes(releaseType)) {
    console.error('Invalid release type:', releaseType);
    process.exit(1);
  }

  return semver.inc(packageJson.version, releaseType);
}

/**
 * Update version in all necessary files
 */
function updateVersion(version) {
  const packagePath = path.join(__dirname, '../package.json');
  const packageLockPath = path.join(__dirname, '../package-lock.json');

  try {
    // Update package.json
    const packageJson = require(packagePath);
    packageJson.version = version;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

    // Update package-lock.json if it exists
    if (fs.existsSync(packageLockPath)) {
      const packageLock = require(packageLockPath);
      packageLock.version = version;
      fs.writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2) + '\n');
    }

    console.log('✨ Version updated to:', version);
    return true;
  } catch (error) {
    console.error('Error updating version:', error);
    process.exit(1);
  }
}

/**
 * Create a version tag in git
 */
function createVersionTag(version) {
  try {
    execSync(`git tag -a v${version} -m "Release v${version}"`);
    console.log('✨ Created git tag:', `v${version}`);
    return true;
  } catch (error) {
    console.error('Error creating git tag:', error);
    process.exit(1);
  }
}

// Export functions for use in other scripts
module.exports = {
  getBuildInfo,
  writeBuildInfo,
  validateVersion,
  getNextVersion,
  updateVersion,
  createVersionTag,
};

// If run directly, write build info
if (require.main === module) {
  writeBuildInfo();
}