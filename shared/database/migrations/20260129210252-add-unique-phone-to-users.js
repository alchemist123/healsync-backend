'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint(
      { tableName: 'users', schema: 'public' },
      {
        fields: ['phone'],
        type: 'unique',
        name: 'unique_users_phone_constraint',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      { tableName: 'users', schema: 'public' },
      'unique_users_phone_constraint',
    );
  },
};
