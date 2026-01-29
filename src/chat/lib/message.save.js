'use strict';

const { Message } = require('../../../shared/database/models');

/**
 * Save a chat message
 */
module.exports = async (thread_id, role, content) => {
    return await Message.create({ thread_id, role, content });
};
