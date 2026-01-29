const chatService = require('../services/chat.service');

/**
 * API to get the current active thread ID for a patient.
 * If no active thread exists, a new one is created and returned.
 */
const getActiveThread = async (req, res) => {
    const { patient_id } = req.query;

    if (!patient_id) {
        return res.status(400).json({ error: 'patient_id is required' });
    }

    try {
        const thread = await chatService.getActiveThread(patient_id);
        res.json({
            success: true,
            thread_id: thread.thread_id,
            status: thread.status
        });
    } catch (error) {
        console.error('Error fetching active thread:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = getActiveThread;
