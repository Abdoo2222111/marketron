// ============================================================
// Winston Logger Configuration
// ============================================================

import winston from 'winston';
import path from 'path';

const logDir = path.resolve(__dirname, '../../logs');

const levels: winston.config.AbstractConfigSetLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = (): string => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

const colors: winston.config.AbstractConfigSetColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format,
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: winston.format.uncolorize(),
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: winston.format.uncolorize(),
  }),
];

const logger: winston.Logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false,
});

export default logger;
