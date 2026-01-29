'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('schedules', {
            schedule_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            doctor_id: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            department_id: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            day_of_week: {
                type: Sequelize.STRING,
                allowNull: false
            },
            start_time: {
                type: Sequelize.TIME,
                allowNull: false
            },
            end_time: {
                type: Sequelize.TIME,
                allowNull: false
            },
            max_appointments: {
                type: Sequelize.INTEGER,
                defaultValue: 10
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('schedules');
    }
};
