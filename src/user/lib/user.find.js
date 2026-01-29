'use strict';

const { User } = require('../../../shared/database/models/index.js');

module.exports = async (aadhaar_number) => {
  try {
    if (!aadhaar_number) {
      throw new Error('aadhaar_number is required');
    }

    return await User.findOne({
      where: {
        aadhaar_number,
      },
    });
  } catch (error) {
    console.error('Create User Error:', error);
    throw error;
  }
};
