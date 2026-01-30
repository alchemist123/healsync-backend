const { Op } = require('sequelize');
const { Token } = require('../../../shared/database/models/index.js');

module.exports = async (doctor_id) => {
  try {
    if (!doctor_id) {
      throw new Error('doctor_id is required');
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const totalCount = await Token.count({
      where: {
        doctor_id,
        appointment_date: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    return totalCount;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
