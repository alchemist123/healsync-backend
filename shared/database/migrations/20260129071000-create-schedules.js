'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            {
                tableName: 'schedules',
                schema: 'hospital',
            },
            {
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
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.NOW,
                },
                updated_at: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.NOW,
                },
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable({
            tableName: 'schedules',
            schema: 'public',
        });
    },
};
