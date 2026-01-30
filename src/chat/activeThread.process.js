'use strict';

const chatLib = require('./lib');
const userLib = require('../user/lib');
const { validate: isUuid } = require('uuid');

/**
 * API to get the current active thread ID for a user.
 * If no active thread exists, a new one is created and returned.
 */
const getActiveThread = async (req, res) => {
    const user_id = req.user.user_id;

    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
    }

    if (!isUuid(user_id)) {
        return res.status(400).json({ error: 'Invalid user_id format. Must be a valid UUID.' });
    }

    try {
        // Check if user exists
        const user = await userLib.findById(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const thread = await chatLib.getActiveThread(user_id);
        res.json({
            success: true,
            thread_id: thread.id,
            status: thread.status
        });
    } catch (error) {
        console.error('Error fetching active thread:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = getActiveThread;
