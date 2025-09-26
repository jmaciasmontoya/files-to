import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig: WinstonModuleOptions = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        context,
        ...meta,
      });
    })
  ),
  defaultMeta: { service: 'file-manager-api' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for security logs
    new winston.transports.File({
      filename: 'logs/security.log',
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
};
