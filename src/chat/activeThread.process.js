const chatService = require('../services/chat.service');

/**
 * API to get the current active thread ID for a patient.
 * If no active thread exists, a new one is created and returned.
 */
const getActiveThread = async (req, res) => {
    const { patientId } = req.query;

    if (!patientId) {
        return res.status(400).json({ error: 'patientId is required' });
    }

    try {
        const thread = await chatService.getActiveThread(patientId);
        res.json({
            success: true,
            threadId: thread.threadId,
            status: thread.status
        });
    } catch (error) {
        console.error('Error fetching active thread:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = getActiveThread;
