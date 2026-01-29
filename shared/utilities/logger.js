const winston = require('winston');
const { combine, timestamp, json } = winston.format;

const ts = timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' });

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    // Always log to stdout so Docker/orchestrators capture with docker logs
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? combine(ts, json()) : winston.format.simple(),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(ts, json()),
    }),
    new winston.transports.File({
      filename: 'logs/info.log',
      level: 'info',
      format: combine(ts, json()),
    }),
  ],
});

module.exports = logger;
