'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(
      {
        tableName: 'hospital_department_doctor',
        schema: 'public',
      },
      {
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
      }
    )
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable({
      tableName: 'hospital_department_doctor',
      schema: 'public',
    });
  }
};
