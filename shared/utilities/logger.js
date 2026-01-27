const winston = require('winston');
const { combine, timestamp, json } = winston.format;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(
        timestamp(
          timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',
          }),
        ),
        json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/info.log',
      level: 'info',
      format: combine(
        timestamp(
          timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',
          }),
        ),
        json(),
      ),
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

module.exports = logger;
