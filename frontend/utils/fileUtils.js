const fs = require('fs');
const path = require('path');

/**
 * Safely removes a file if it exists
 * @param {string} filePath Path to the file to remove
 * @returns {boolean} True if file was removed, false if it didn't exist
 */
const safeRemoveFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error removing file ${filePath}:`, error);
    return false;
  }
};

/**
 * Creates a directory if it doesn't exist
 * @param {string} dirPath Path to the directory
 * @returns {boolean} True if directory was created or already exists
 */
const ensureDirectory = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
    return false;
  }
};

/**
 * Get relative path from root directory
 * @param {string} filePath Absolute path
 * @returns {string} Relative path from project root
 */
const getRelativePath = (filePath) => {
  const rootDir = process.cwd();
  return path.relative(rootDir, filePath);
};

/**
 * Move a file from one location to another
 * @param {string} sourcePath Source file path
 * @param {string} targetPath Target file path
 * @returns {boolean} True if file was moved successfully
 */
const moveFile = (sourcePath, targetPath) => {
  try {
    const targetDir = path.dirname(targetPath);
    ensureDirectory(targetDir);
    fs.renameSync(sourcePath, targetPath);
    return true;
  } catch (error) {
    console.error(`Error moving file from ${sourcePath} to ${targetPath}:`, error);
    return false;
  }
};

module.exports = {
  safeRemoveFile,
  ensureDirectory,
  getRelativePath,
  moveFile
};