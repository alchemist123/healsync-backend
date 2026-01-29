'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE hospital.doctors DROP COLUMN IF EXISTS department_id;',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE hospital.doctors DROP COLUMN IF EXISTS institution_id;',
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      { tableName: 'doctors', schema: 'hospital' },
      'department_id',
      { type: Sequelize.UUID, allowNull: true },
    );
    await queryInterface.addColumn(
      { tableName: 'doctors', schema: 'hospital' },
      'institution_id',
      { type: Sequelize.UUID, allowNull: true },
    );
  },
};
