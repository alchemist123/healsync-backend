'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // This migration creates the "consultation" schema in PostgreSQL
    await queryInterface.createSchema('consultation');
  },

  async down(queryInterface, Sequelize) {
    // This migration drops the "consultation" schema from PostgreSQL
    await queryInterface.dropSchema('consultation');
  }
};
