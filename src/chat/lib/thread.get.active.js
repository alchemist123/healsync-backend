'use strict';

const { Thread } = require('../../../shared/database/models');
const { validate: isUuid } = require('uuid');

/**
 * Get the current active thread for a user or create a new one
 */
module.exports = async (user_id) => {
    if (!isUuid(user_id)) {
        throw new Error('Invalid user_id format. Must be a UUID.');
    }

    let thread = await Thread.findOne({
        where: {
            user_id,
            status: 'active'
        },
        order: [['created_at', 'DESC']]
    });

    if (!thread) {
        thread = await Thread.create({
            user_id,
            status: 'active'
        });
    }
    return thread;
};
