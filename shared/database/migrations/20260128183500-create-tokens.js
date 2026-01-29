'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            {
                tableName: 'tokens',
                schema: 'public',
            },
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    primaryKey: true,
                    allowNull: false,
                },
                token_number: {
                    type: Sequelize.STRING,
                    unique: true,
                    allowNull: false,
                },
                thread_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                },
                appointment_id: {
                    type: Sequelize.UUID,
                    allowNull: true,
                },
                patient_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                },
                issued_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW,
                },
                status: {
                    type: Sequelize.STRING,
                    defaultValue: 'pending',
                },
                queue_position: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                },
                estimated_time: {
                    type: Sequelize.DATE,
                    allowNull: true,
                },
                actual_time: {
                    type: Sequelize.DATE,
                    allowNull: true,
                },
                doctor_id: {
                    type: Sequelize.UUID,
                    allowNull: true,
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
            tableName: 'tokens',
            schema: 'public',
        });
    },
};
