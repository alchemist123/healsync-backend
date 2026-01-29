'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      {
        tableName: 'medicines',
        schema: 'consultation',
      },
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        medicine_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        dosage: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        intake_timing: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        ingredients: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        document_id: {
          type: Sequelize.UUID,
          allowNull: false,
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
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({
      tableName: 'medicines',
      schema: 'consultation',
    });
  },
};
