import winston, {format} from 'winston';
import {serverLogLevel} from 'application-config';

const {combine, timestamp, json, label} = format;
const logLevel = serverLogLevel;
const errorStackFormat = winston.format(info => {
  if (info.error && info.error instanceof Error) {
    return Object.assign({}, info, {
      stack: info.error.stack,
      error: info.error.message,
    });
  }
  return info;
});

const formators = [errorStackFormat(), timestamp(), label({label: '(stencil app)'}), json()];

const logger = winston.createLogger({
  level: logLevel,
  transports: [new winston.transports.Console()],
  format: combine(...formators),
});

logger.silly({
  type: '@stencil/logger',
  message: 'winston logger configured',
  data: {
    level: logLevel,
  },
});

export default logger;
