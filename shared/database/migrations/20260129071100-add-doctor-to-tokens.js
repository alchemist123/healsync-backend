'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('tokens', 'doctor_id', {
            type: Sequelize.INTEGER,
            allowNull: true
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('tokens', 'doctor_id');
    }
};
