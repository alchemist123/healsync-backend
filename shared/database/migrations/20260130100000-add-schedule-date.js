'use strict';

/** @type {import('sequelize-cli').Migration} */
const table = { tableName: 'schedules', schema: 'consultation' };
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'schedule_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(table, 'schedule_date');
  },
};
