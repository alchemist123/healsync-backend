'use strict';

const { Patient } = require('../../../shared/database/models/index.js');

module.exports = async (user_id) => {
  try {
    if (!user_id) {
      throw new Error('user_id is required');
    }

    return await Patient.findOne({
      where: {
        user_id,
      },
    });
  } catch (error) {
    console.error('Create User Error:', error);
    throw error;
  }
};
