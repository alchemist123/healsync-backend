const RagAgent = require('../agents/rag.agent');
const { generatePatientToken } = require('./lib/token.service');
const aai = require('../agents/llm/assemblyai');
const { triggerBackgroundSummary } = require('../workers/summarization');

const chatService = require('../services/chat.service');

const processMessage = async (req, res) => {
    let { message, threadId, patientId, isAudio } = req.body;

    // SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        // Ensure thread exists
        await chatService.getOrCreateThread(threadId, patientId);

        // 1. Voice Transcription
        if (isAudio && message.startsWith('http')) {
            const transcript = await aai.transcripts.transcribe({ audio: message });
            message = transcript.text;
            res.write(`data: ${JSON.stringify({ type: 'transcript', text: message })}\n\n`);
        }

        // 2. Vector Search / KB Retrieval
        const kbContext = await chatService.getRelevantKbContext(message);

        // 3. Get recent history for context
        const history = await chatService.getRecentMessages(threadId, 5);

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
            const tokenNumber = generatePatientToken(threadId, patientId);
            await chatService.completeThread(threadId, patientId, tokenNumber);
            res.write(`data: ${JSON.stringify({ type: 'token_generated', token: tokenNumber })}\n\n`);
        }

        // 6. DB Operations & Background Summary
        await chatService.saveMessage(threadId, 'user', message);
        await chatService.saveMessage(threadId, 'assistant', fullContent);

        // Trigger background summary
        triggerBackgroundSummary(threadId);

        res.write('event: end\ndata: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Chat processing error:', error);
        if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
            res.end();
        }
    }
};

module.exports = processMessage;
