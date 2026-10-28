import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to setup daily log file rotation
 * This ensures log files are created with date-based names
 * Run this script daily via cron job or scheduler
 */

const logDir = path.join(__dirname, '../logs');
const userActionLogDir = path.join(logDir, 'user-actions');

function setupDailyLogFiles() {
  const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Ensure directories exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  if (!fs.existsSync(userActionLogDir)) {
    fs.mkdirSync(userActionLogDir, { recursive: true });
  }

  // Create empty log files for today if they don't exist
  const logFiles = [
    `${dateStr}_error.log`,
    `${dateStr}_warning.log`,
    `${dateStr}_info.log`,
    `${dateStr}_combined.log`,
    `${dateStr}_debug.log`,
  ];

  const userActionFiles = [
    `${dateStr}_user-actions.log`,
    `${dateStr}_user-actions-error.log`,
  ];

  logFiles.forEach((file) => {
    const filePath = path.join(logDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '');
      console.log(`Created log file: ${file}`);
    }
  });

  userActionFiles.forEach((file) => {
    const filePath = path.join(userActionLogDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '');
      console.log(`Created user action log file: ${file}`);
    }
  });

  // Cleanup old log files (older than 30 days)
  cleanupOldLogFiles(logDir, 30);
  cleanupOldLogFiles(userActionLogDir, 90);

  console.log('Daily log rotation setup complete');
}

function cleanupOldLogFiles(directory: string, daysToKeep: number) {
  if (!fs.existsSync(directory)) {
    return;
  }

  const files = fs.readdirSync(directory);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.mtime < cutoffDate) {
      fs.unlinkSync(filePath);
      console.log(`Deleted old log file: ${file}`);
    }
  });
}

// Run setup
setupDailyLogFiles();
