'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      {
        tableName: 'medical_documents',
        schema: 'consultation',
      },
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        s3_url: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        consultation_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        document_type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        file_type: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'image',
        },
        doctor_id: {
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
      tableName: 'medical_documents',
      schema: 'consultation',
    });
  },
};
