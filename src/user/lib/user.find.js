'use strict';

const { User } = require('../../../shared/database/models/index.js');

module.exports = async (phone) => {
  try {
    if (!phone) {
      throw new Error('phone is required');
    }

    return await User.findOne({
      where: {
        phone,
      },
    });
  } catch (error) {
    console.error('Create User Error:', error);
    throw error;
  }
};
