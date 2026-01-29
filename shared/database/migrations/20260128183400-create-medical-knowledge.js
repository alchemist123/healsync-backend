'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('medical_knowledge', {
          id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
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
        await queryInterface.dropTable('medical_knowledge');
    }
};
