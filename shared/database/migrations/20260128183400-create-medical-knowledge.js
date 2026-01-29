'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            {
                tableName: 'medical_knowledge',
                schema: 'public',
            },
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    primaryKey: true,
                    allowNull: false,
                },
                title: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                content: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
                embedding: {
                    type: 'VECTOR(1536)',
                    allowNull: true,
                },
                category: {
                    type: Sequelize.STRING,
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
            tableName: 'medical_knowledge',
            schema: 'public',
        });
    },
};
