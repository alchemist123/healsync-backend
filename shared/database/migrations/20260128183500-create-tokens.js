'use strict';
/** @type {import('sequelize-cli').Migration} */
const table = { tableName: 'tokens', schema: 'patients' };
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(table, {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      token_number: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      thread_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      appointment_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      patient_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      appointment_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(table);
  },
};
