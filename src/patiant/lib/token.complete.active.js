'use strict';

const { Token } = require('../../../shared/database/models/index.js');


module.exports = async (patient_id, doctor_id, options = {}) => {
  try {
    if (!patient_id) {
      throw new Error('patient_id is required');
    }

    if (!doctor_id) {
      throw new Error('doctor_id is required');
    }

    return await Token.update(
      { status: 'completed' },
      {
        where: {
          patient_id,
          doctor_id,
          status: 'active',
        },
        ...options
      }
    );
  } catch (error) {
    console.error('Error completing active tokens:', error);
    throw error;
  }
};
