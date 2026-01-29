'use strict';

const { User } = require('../../../shared/database/models/index.js');

module.exports = async ({ phone, aadhaar_number, user_type }) => {
  try {
    if (!phone || !aadhaar_number || !user_type) {
      throw new Error('phone, aadhaar_number and user_type are required');
    }

    const user = await User.create({
      phone,
      aadhaar_number,
      user_type,
    });

    return user;
  } catch (error) {
    console.error('Create User Error:', error);
    throw error;
  }
};
