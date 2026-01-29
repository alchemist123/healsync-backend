const hospital = require('./lib');
const logger = require('@shared/utilities/logger');

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
function isValidUUID(value) {
  if (value == null) return false;
  return UUID_REGEX.test(String(value).trim());
}

module.exports = async (req, res) => {
  try {
    const body = req.body || {};
    const replaceWeek = Boolean(req.query?.replace_week ?? body.replace_week ?? true);

    const institution_id = body.institution_id ?? req.query?.institution_id;
    if (!institution_id || !isValidUUID(institution_id)) {
      return res.status(400).json({
        message: 'institution_id is required and must be a valid UUID (in body or query)',
      });
    }

    if (!body.schedule || typeof body.schedule !== 'object') {
      return res.status(400).json({
        message: 'Invalid payload: "schedule" object with department names as keys is required',
      });
    }

    const payload = { ...body, institution_id };
    const result = await hospital.saveSchedule(payload, replaceWeek);
    return res.json({
      message: `Saved ${result.created} schedule slot(s); ${result.inactivated} previous slot(s) set inactive`,
      created: result.created,
      schedule_ids: result.schedule_ids,
      inactivated: result.inactivated,
    });
  } catch (error) {
    if (error?.code === 'MISSING_INSTITUTION_ID') {
      return res.status(400).json({ message: error.message });
    }
    logger.error('hospital save schedule error', {
      error: error?.message,
      stack: error?.stack,
    });
    return res.status(500).json({ message: 'Internal server error' });
  }
};
