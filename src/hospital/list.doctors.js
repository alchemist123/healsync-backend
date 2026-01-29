const hospitalLib = require('./lib');
const logger = require('@shared/utilities/logger');

function normalizeUUID(value) {
  if (value == null || typeof value !== 'string') return value;
  return value.trim().replace(/^["']|["']$/g, '');
}

module.exports = async (req, res) => {
  try {
    const raw = req.query?.institution_id;
    const institution_id = raw ? normalizeUUID(raw) : null;

    const doctors = await hospitalLib.doctorList(institution_id);

    return res.json({ doctors });
  } catch (error) {
    logger.error('hospital list doctors error', { error: error?.message, stack: error?.stack });
    return res.status(500).json({ message: 'Internal server error' });
  }
};
