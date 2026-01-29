'use strict';

/** @type {import('sequelize-cli').Migration} */
const table = { tableName: 'schedules', schema: 'consultation' };
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'institution_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(table, 'institution_id');
  },
};
