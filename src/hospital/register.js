const hospital = require('./lib');
const logger = require('@shared/utilities/logger');
const isExist = require('./lib/isExist');
module.exports = async (req, res) => {
  try {
    const body = req.body || {};
    const { name, type, address, city, state, country, license_number } = body;
    const param = {
      institution_name: name,
      institution_type: type,
      address,
      city,
      state,
      country,
      license_number,
    };
    const isExist = await isExist({ license_number });
    if (isExist) {
      return res.status(400).json({ message: 'Hospital already exists' });
    }
    const result = await hospital.create(param);
    return res.json(result);
  } catch (error) {
    logger.error('hospital register error', { error: error?.message, stack: error?.stack });
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};