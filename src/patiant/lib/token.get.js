const { Token } = require('../../../shared/database/models/index.js');

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
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
