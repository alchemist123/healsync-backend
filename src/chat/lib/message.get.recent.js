'use strict';

const { Message } = require('../../../shared/database/models');

/**
 * Get recent messages for a thread
 */
module.exports = async (thread_id, limit = 5) => {
    const messages = await Message.findAll({
        where: { thread_id },
        order: [['created_at', 'DESC']],
        limit
    });
    return messages.reverse().map(m => ({ role: m.role, content: m.content }));
};
