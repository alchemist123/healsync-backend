'use strict';

const { Message } = require('../../../shared/database/models');

/**
 * Get message count for a thread
 */
module.exports = async (thread_id) => {
    return await Message.count({ where: { thread_id } });
};
