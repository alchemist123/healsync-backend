'use strict';

const crypto = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const departments = [
      { id: crypto.randomUUID(), name: 'General Medicine' },
      { id: crypto.randomUUID(), name: 'Cardiology' },
      { id: crypto.randomUUID(), name: 'Neurology' },
      { id: crypto.randomUUID(), name: 'Orthopedics' },
      { id: crypto.randomUUID(), name: 'Pediatrics' },
      { id: crypto.randomUUID(), name: 'Dermatology' },
      { id: crypto.randomUUID(), name: 'ENT (Ear, Nose & Throat)' },
      { id: crypto.randomUUID(), name: 'Ophthalmology' },
      { id: crypto.randomUUID(), name: 'Psychiatry' },
      { id: crypto.randomUUID(), name: 'Pulmonology' },
      { id: crypto.randomUUID(), name: 'Gastroenterology' },
      { id: crypto.randomUUID(), name: 'Urology' },
      { id: crypto.randomUUID(), name: 'Obstetrics & Gynecology' },
      { id: crypto.randomUUID(), name: 'Emergency Medicine' },
      { id: crypto.randomUUID(), name: 'Radiology' },
    ];

    await queryInterface.bulkInsert(
      { tableName: 'departments', schema: 'hospital' },
      departments,
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      { tableName: 'departments', schema: 'hospital' },
      null,
      {},
    );
  },
};
