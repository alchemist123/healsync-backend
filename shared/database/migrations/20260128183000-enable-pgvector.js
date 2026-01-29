'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');
    },
    down: async (queryInterface, Sequelize) => {
        // Optionally drop extension, but usually better to leave it if other things depend on it
        // await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS vector;');
    }
};
