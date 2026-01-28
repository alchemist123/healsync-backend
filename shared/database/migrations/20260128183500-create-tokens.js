'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('tokens', {
            token_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            token_number: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            thread_id: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: 'threads',
                    key: 'thread_id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            appointment_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            patient_id: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            issued_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            status: {
                type: Sequelize.STRING,
                defaultValue: 'pending'
            },
            queue_position: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            estimated_time: {
                type: Sequelize.DATE,
                allowNull: true
            },
            actual_time: {
                type: Sequelize.DATE,
                allowNull: true
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
        await queryInterface.dropTable('tokens');
    }
};
