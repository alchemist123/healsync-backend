'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('threads', {
          id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
          },
          patient_id: {
            type: Sequelize.UUID,
            allowNull: false,
          },
          status: {
            type: Sequelize.ENUM('active', 'completed'),
            defaultValue: 'active',
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
        await queryInterface.dropTable('threads');
    }
};
