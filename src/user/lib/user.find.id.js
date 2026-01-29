'use strict';

const { User } = require('../../../shared/database/models/index.js');

module.exports = async (id) => {
  try {
    if (!id) {
      throw new Error('id is required');
    }

    return await User.findByPk(id);
  } catch (error) {
    console.error('Find User By ID Error:', error);
    throw error;
  }
};
