'use strict';

/** @type {import('sequelize-cli').Migration} */
const table = { tableName: 'hospital_department_doctor', schema: 'hospital' };
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(table, {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      hospital_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      department_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(table);
  }
};
