'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(
      {
        tableName: 'users',
        schema: 'public'
      },
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        phone:{
          type: Sequelize.STRING,
          allowNull: false
        },
        aadhaar_number:{
          type: Sequelize.STRING,
          allowNull: false
        },
        user_type:{
          type: Sequelize.ENUM('admin', 'doctor', 'patient'),
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false
        }
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable({
      tableName: 'users',
      schema: 'public'
    });
  }
};
