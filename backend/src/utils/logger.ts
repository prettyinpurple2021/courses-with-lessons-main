import winston from 'winston';

const { combine, timestamp, json, colorize, printf } = winston.format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
  return `${timestamp} [${level}]: ${message} ${metaString}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    json() // Default to JSON for production
  ),
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development'
        ? combine(colorize(), timestamp(), devFormat)
        : combine(timestamp(), json())
    }),
    // We could add file transports here if needed, but for containerized apps, stdout is best
  ],
});

// Create a stream for Morgan or other middleware if needed
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
