const logger = require('./lib/auditLogger');
const randomString = require('@shared/utilities/randomString');

module.exports = (req, res, next) => {
  let request_id = randomString();
  req.headers['request-id'] = request_id;
  logger.info(
    `request: ${req.method} ${req.path} request-id:${request_id}: ${JSON.stringify(req.body)}`,
  );
  const response = res.send;
  res.send = function (data) {
    response.call(this, data);
    if (typeof data == 'string') {
      let response_request_id = this.getHeaders()['request-id']; // Get request ID from response headers
      logger.info(`response: ${req.method} ${req.path} request-id:${response_request_id}: ${data}`);
    }
  };
  next();
};
