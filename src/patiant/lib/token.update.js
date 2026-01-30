const { Token } = require('../../../shared/database/models');

module.exports = async (token_number, doctor_id, update_value) => {
  try {
    if (!token_number || !doctor_id || !update_value) {
      throw new Error('token_number, doctor_id and update_value are required');
    }

    return await Token.update(
      { status: update_value },
      {
        where: {
          token_number,
          doctor_id,
        },
      },
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};
