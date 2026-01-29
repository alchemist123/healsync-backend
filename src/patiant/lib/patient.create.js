'use strict';

const { Patient } = require('../../../shared/database/models/index.js');

module.exports = async (patientData) => {
  try {
    const { user_id, abha_address, abha_number } = patientData;

    if (!user_id || !abha_address || !abha_number) {
      throw new Error('user_id, abha_address and abha_number are required');
    }

    const patient = await Patient.create(patientData);

    return patient;
  } catch (error) {
    console.error('Create patient Error:', error);
    throw error;
  }
};
