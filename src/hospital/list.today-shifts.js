const hospital = require('./lib');
const logger = require('@shared/utilities/logger');

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const VALID_SHIFT_TYPES = ['all', 'morning', 'afternoon', 'night'];

function isValidUUID(value) {
  if (value == null) return false;
  return UUID_REGEX.test(String(value).trim());
}

module.exports = async (req, res) => {
  try {
    const institution_id = req.query?.institution_id?.trim();
    let shift_type = req.query?.shift_type?.trim();
    if (!shift_type) shift_type = 'all';
    shift_type = shift_type.toLowerCase();
    if (!VALID_SHIFT_TYPES.includes(shift_type)) {
      return res.status(400).json({
        message: `shift_type must be one of: ${VALID_SHIFT_TYPES.join(', ')}`,
      });
    }

    if (!institution_id || !isValidUUID(institution_id)) {
      return res.status(400).json({
        message: 'institution_id is required and must be a valid UUID (query param)',
      });
    }

    const result = await hospital.getTodayShifts(institution_id, shift_type);
    return res.json(result);
  } catch (error) {
    logger.error('hospital list today shifts error', {
      error: error?.message,
      stack: error?.stack,
    });
    return res.status(500).json({ message: 'Internal server error' });
  }
};
