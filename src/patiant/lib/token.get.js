const { Token, User, Doctor } = require('../../../shared/database/models/index.js');

module.exports = async (patient_id) => {
  try {
    if (!patient_id) {
      throw new Error('patient_id is required');
    }

    return await Token.findOne({
      where: {
        patient_id,
        status: 'active',
      },
      include: [
        {
          model: User,
          attributes: ['id'],
          include: [
            {
              model: Doctor,
              as: 'doctor',
            },
          ],
        },
      ],
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
