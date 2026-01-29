'use strict';

const SummarizerAgent = require('../agents/summarizer.agent');
const chatLib = require('../chat/lib');

/**
 * Non-blocking background summarization logic
 */
const triggerBackgroundSummary = async (threadId) => {
    const count = await chatLib.getMessageCount(threadId);
    if ((count + 1) % 4 === 0) {
        console.log(`[Summary] Triggering background summary for thread ${threadId}`);

        // Fire and forget (don't await)
        (async () => {
            try {
                const recentMessages = await chatLib.getRecentMessages(threadId, 4);
                const summary = await SummarizerAgent.summarize(recentMessages);
                await chatLib.saveSummary(threadId, summary);
            } catch (err) {
                console.error('[Summary] Background Error:', err);
            }
        })();
    }
};

module.exports = {
    triggerBackgroundSummary
};
