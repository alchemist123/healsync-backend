'use strict';

/** @type {import('sequelize-cli').Migration} */

const table = { tableName: 'patient', schema: 'patients' };

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.createSchema('patients');

    await queryInterface.createTable(table, {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },

      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      middle_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      last_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      year_of_birth: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      month_of_birth: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      day_of_birth: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      gender: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      emergency_contact: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },

      pincode: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },

      blood_group: {
        type: Sequelize.STRING(5),
        allowNull: true,
      },

      abha_address: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },

      abha_number: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
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
    await queryInterface.sequelize.dropSchema('patients');
  },
};
