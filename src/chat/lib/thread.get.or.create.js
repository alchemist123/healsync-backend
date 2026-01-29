'use strict';

const { Thread } = require('../../../shared/database/models');
const { validate: isUuid } = require('uuid');
const getActiveThread = require('./thread.get.active');

/**
 * Find or create a thread
 */
module.exports = async (id, user_id) => {
    if (!id || !isUuid(id)) {
        return await getActiveThread(user_id);
    }
    let thread = await Thread.findByPk(id);
    if (!thread) {
        return await getActiveThread(user_id);
    }
    return thread;
};
