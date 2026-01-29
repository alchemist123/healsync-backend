'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('schedules', {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
          },
          doctor_id: {
            type: Sequelize.UUID,
            allowNull: false,
          },
          department_id: {
            type: Sequelize.UUID,
            allowNull: false,
          },
          day_of_week: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          start_time: {
            type: Sequelize.TIME,
            allowNull: false,
          },
          end_time: {
            type: Sequelize.TIME,
            allowNull: false,
          },
          max_appointments: {
            type: Sequelize.INTEGER,
            defaultValue: 10,
          },
          is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
          },
          created_at: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
          },
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('schedules');
    }
};
