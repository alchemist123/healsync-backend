const winston = require('winston');
const { combine, timestamp, json } = winston.format;

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }), json()),
  transports: [
    new winston.transports.File({
      filename: 'logs/audit.log',
      level: 'info',
      format: combine(timestamp(), json()),
    }),
  ],
});
logger.add(
  new winston.transports.Console({
    format: winston.format.simple(),
  }),
);

module.exports = logger;
