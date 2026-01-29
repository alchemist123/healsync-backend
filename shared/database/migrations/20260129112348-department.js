'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.createTable(
    {
      tableName: 'departments',
      schema: 'public',
    },
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    );

  },

  async down(queryInterface, Sequelize) {
        await queryInterface.dropTable({
            tableName: 'departments',
            schema: 'public',
        });
    }
};
