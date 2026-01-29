const { Department } = require('@shared/database/models');
const logger = require('@shared/utilities/logger');

module.exports = async (req, res) => {
  try {
    const departments = await Department.findAll({
      order: [['name', 'ASC']],
      attributes: ['id', 'name'],
    });
    return res.json({ departments });
  } catch (error) {
    logger.error('hospital list departments error', { error: error?.message, stack: error?.stack });
    return res.status(500).json({ message: 'Internal server error' });
  }
};
