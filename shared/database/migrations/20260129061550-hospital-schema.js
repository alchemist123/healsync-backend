'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // This migration creates the "hospital" schema in the database (for PostgreSQL)
    await queryInterface.createSchema('hospital');
  },

  async down(queryInterface, Sequelize) {
    // This migration drops the "hospital" schema from the database (for PostgreSQL)
    await queryInterface.dropSchema('hospital');
  }
};
