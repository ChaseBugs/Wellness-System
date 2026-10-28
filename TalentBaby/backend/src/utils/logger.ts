import winston from 'winston';
// @ts-ignore - winston-daily-rotate-file doesn't have types
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

const logDir = path.join(__dirname, '../../logs');
const userActionLogDir = path.join(logDir, 'user-actions');

// Ensure log directories exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
if (!fs.existsSync(userActionLogDir)) {
  fs.mkdirSync(userActionLogDir, { recursive: true });
}

// Custom format for user actions
const userActionFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Daily rotate file transport options
const createDailyRotateTransport = (filename: string, level?: string, maxSize?: string, maxFiles?: string) => {
  return new DailyRotateFile({
    filename: path.join(logDir, filename),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,
    maxSize: maxSize || '5m',
    maxFiles: maxFiles || '30d',
    level: level,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
  });
};

// Main application logger with date-based files
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'talent-baby-api' },
  transports: [
    // Error log file - date based (YYYY-MM-DD_error.log)
    createDailyRotateTransport('error.log', 'error', '5m', '30d'),
    // Warning log file - date based (YYYY-MM-DD_warning.log)
    createDailyRotateTransport('warning.log', 'warn', '5m', '30d'),
    // Info log file - date based (YYYY-MM-DD_info.log)
    createDailyRotateTransport('info.log', 'info', '5m', '30d'),
    // Combined log file - date based (YYYY-MM-DD_combined.log)
    createDailyRotateTransport('combined.log', undefined, '5m', '30d'),
    // Debug log file (only in development) - date based
    ...(process.env.NODE_ENV !== 'production'
      ? [createDailyRotateTransport('debug.log', 'debug', '5m', '7d')]
      : []),
  ],
});

// User action logger - separate file for user actions (date-based)
const userActionLogger = winston.createLogger({
  level: 'info',
  format: userActionFormat,
  defaultMeta: { service: 'talent-baby-api', type: 'user-action' },
  transports: [
    // Daily user action log files - date based (YYYY-MM-DD_user-actions.log)
    new DailyRotateFile({
      filename: path.join(userActionLogDir, 'user-actions.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxSize: '10m',
      maxFiles: '90d',
      format: userActionFormat,
    }),
    // Separate error log for user actions - date based (YYYY-MM-DD_user-actions-error.log)
    new DailyRotateFile({
      filename: path.join(userActionLogDir, 'user-actions-error.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxSize: '5m',
      maxFiles: '90d',
      level: 'error',
      format: userActionFormat,
    }),
  ],
});

// If we're not in production, log to console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );

  userActionLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((info) => {
          return `[USER ACTION] ${info.timestamp} - ${info.level}: ${JSON.stringify(info)}`;
        })
      ),
    })
  );
}

// Helper function to log user actions to file
export const logUserAction = (
  userId: number | null,
  action: string,
  details: any = {},
  ipAddress?: string,
  userAgent?: string
) => {
  const logLevel = details.statusCode && details.statusCode >= 400 ? 'error' : 'info';
  
  const logData = {
    userId,
    action,
    details,
    ipAddress: ipAddress || details.ip || null,
    userAgent: userAgent || details.userAgent || null,
    timestamp: new Date().toISOString(),
  };

  if (logLevel === 'error') {
    userActionLogger.error('User action', logData);
  } else {
    userActionLogger.info('User action', logData);
  }
};

export { logger, userActionLogger };
