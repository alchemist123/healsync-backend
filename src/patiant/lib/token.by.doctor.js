const { Op } = require('sequelize');
const { Token, Patient, User } = require('../../../shared/database/models/index.js');

module.exports = async (doctor_id) => {
  try {
    if (!doctor_id) {
      throw new Error('doctor_id is required');
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const tokens = await Token.findAll({
      where: {
        doctor_id,
        status: 'active',
        appointment_date: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      attributes: ['token_number', 'status'],
      order: [['appointment_date', 'ASC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id'],
          include: [
            {
              model: Patient,
              as: 'patients',
              attributes: [
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'gender',
                'year_of_birth',
                'month_of_birth',
                'day_of_birth',
              ],
            },
          ],
        },
      ],
    });

    return tokens;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
