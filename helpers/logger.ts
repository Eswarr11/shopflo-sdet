import { createLogger, format, transports, Logger } from 'winston';
import * as path from 'path';
import * as fs from 'fs';

const LOG_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logFormat = format.printf(({ timestamp, level, message }) =>
  `${timestamp} [${level.toUpperCase()}]: ${message}`
);

const logger: Logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.File({
      filename: path.join(LOG_DIR, 'playwright-actions.log'),
    }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
  ],
});

export default logger;
