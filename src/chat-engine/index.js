const RagAgent = require('../agents/rag.agent');
const SummarizerAgent = require('../agents/summarizer.agent');
const TokenService = require('../services/token.service');
const aai = require('../agents/llm/assemblyai');

// Mock DB/Vector interfaces - to be replaced with actual implementations
const mockDb = {
    getRelevantKbContext: async (query) => "Medical Knowledge: Standard pre-op requires blood test and 8h fasting.",
    saveMessage: async (threadId, role, content) => console.log(`[DB] Saved ${role}`),
    getMessageCount: async (threadId) => 3, // Mock count to trigger summary on 4th
    getRecentMessages: async (threadId, count) => [{ role: 'user', content: 'hello' }],
    saveSummary: async (threadId, summary) => console.log(`[DB] Summary saved: ${summary.substring(0, 20)}...`)
};

class ChatEngine {
    /**
     * Main entry point for processing a chat message.
     * Orchestrates RAG, Streaming, and Background Tasks.
     */
    static async processMessage(req, res) {
        let { message, threadId, patientId, isAudio } = req.body;

        // SSE Headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
            // 1. Voice Transcription
            if (isAudio && message.startsWith('http')) {
                const transcript = await aai.transcripts.transcribe({ audio: message });
                message = transcript.text;
                res.write(`data: ${JSON.stringify({ type: 'transcript', text: message })}\n\n`);
            }

            // 2. Vector Search / KB Retrieval
            // In a real scenario, embed 'message' and search pgvector
            const kbContext = await mockDb.getRelevantKbContext(message);

            // 3. Get recent history for context (optional but recommended)
            const history = await mockDb.getRecentMessages(threadId, 5);

            // 4. Stream response from RAG Agent
            const stream = await RagAgent.streamResponse(message, kbContext, history);

            let fullContent = "";
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                    fullContent += content;
                    res.write(`data: ${JSON.stringify({ type: 'content', delta: content })}\n\n`);
                }
            }

            // 5. Check for completion -> Token Generation
            if (fullContent.toLowerCase().includes("all prerequisite procedures are complete")) {
                const token = TokenService.generatePatientToken(threadId, patientId);
                res.write(`data: ${JSON.stringify({ type: 'token_generated', token })}\n\n`);
            }

            // 6. DB Operations & Background Summary (Non-blocking)
            await mockDb.saveMessage(threadId, 'user', message);
            await mockDb.saveMessage(threadId, 'assistant', fullContent);

            // Simple background summary every 4 messages
            this.triggerBackgroundSummary(threadId);

            res.write('event: end\ndata: [DONE]\n\n');
            res.end();

        } catch (error) {
            console.error('ChatEngine Error:', error);
            res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
            res.end();
        }
    }

    /**
     * Non-blocking background summarization logic
     */
    static async triggerBackgroundSummary(threadId) {
        const count = await mockDb.getMessageCount(threadId);
        if ((count + 1) % 4 === 0) {
            console.log(`[Summary] Triggering background summary for thread ${threadId}`);

            // Fire and forget (don't await)
            (async () => {
                try {
                    const recentMessages = await mockDb.getRecentMessages(threadId, 4);
                    const summary = await SummarizerAgent.summarize(recentMessages);
                    await mockDb.saveSummary(threadId, summary);
                } catch (err) {
                    console.error('[Summary] Background Error:', err);
                }
            })();
        }
    }
}

module.exports = ChatEngine;