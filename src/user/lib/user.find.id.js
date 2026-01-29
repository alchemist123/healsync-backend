'use strict';

const { User } = require('../../../shared/database/models/index.js');

/**
 * Find a user by their primary key (ID)
 */
module.exports = async (id) => {
    try {
        if (!id) {
            throw new Error('id is required');
        }

        return await User.findByPk(id);
    } catch (error) {
        console.error('Find User By ID Error:', error);
        throw error;
    }
};
