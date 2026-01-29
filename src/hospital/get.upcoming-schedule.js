const hospital = require('./lib');
const logger = require('@shared/utilities/logger');

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUUID(value) {
  if (value == null) return false;
  return UUID_REGEX.test(String(value).trim());
}

module.exports = async (req, res) => {
  try {
    const institution_id = req.query?.institution_id?.trim();

    if (!institution_id || !isValidUUID(institution_id)) {
      return res.status(400).json({
        message: 'Invalid or missing institution_id: query param must be a valid UUID',
      });
    }

    const result = await hospital.getUpcomingWeekSchedule(institution_id);
    return res.json(result);
  } catch (error) {
    logger.error('hospital get upcoming schedule error', {
      error: error?.message,
      stack: error?.stack,
    });
    return res.status(500).json({ message: 'Internal server error' });
  }
};
