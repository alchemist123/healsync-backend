'use strict';

const RagAgent = require('../agents/rag.agent');
const { generatePatientToken } = require('./lib/token.service');
const aai = require('../agents/llm/assemblyai');
const { triggerBackgroundSummary } = require('../workers/summarization');
const chatLib = require('./lib');
const doctorService = require('../services/doctor.service');
const { validate: isUuid } = require('uuid');
const fs = require('fs');

/**
 * Main chat message processor
 */
const processMessage = async (req, res) => {
    let { message, thread_id, user_id, is_audio, hospital_id } = req.body;
    const audioFile = req.file;

    // SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        if (!user_id) {
            throw new Error('user_id is required');
        }

        if (!isUuid(user_id)) {
            throw new Error('Invalid user_id format. Must be a UUID.');
        }

        // 1. Voice Transcription if is_audio is true
        // Handle is_audio as string (multipart) or boolean (JSON)
        const audioEnabled = is_audio === true || is_audio === 'true';

        if (audioEnabled && audioFile) {
            console.log(`[Chat] Transcribing audio file: ${audioFile.path}`);
            const transcript = await aai.transcripts.transcribe({
                audio: audioFile.path
            });
            message = transcript.text;

            // Notify client about the transcription
            res.write(`data: ${JSON.stringify({ type: 'transcript', text: message })}\n\n`);

            // Cleanup temp file
            if (fs.existsSync(audioFile.path)) {
                fs.unlinkSync(audioFile.path);
            }
        } else if (audioEnabled && !audioFile) {
            // Fallback for backward compatibility if is_audio is true but message is a URL
            if (message && message.startsWith('http')) {
                const transcript = await aai.transcripts.transcribe({ audio: message });
                message = transcript.text;
                res.write(`data: ${JSON.stringify({ type: 'transcript', text: message })}\n\n`);
            }
        }

        if (!message) {
            throw new Error('Message content or audio file is required');
        }

        // Ensure thread exists
        const thread = await chatLib.getOrCreateThread(thread_id, user_id);
        const currentThreadId = thread.id;

        // 2. Vector Search / KB Retrieval
        const kbContext = await chatLib.getRelevantKbContext(message);

        // 3. Get recent history for context
        const history = await chatLib.getRecentMessages(currentThreadId, 5);

        // 4. Get Available Doctors Context
        const doctorContext = await doctorService.getSchedulesForPrompt();

        // 5. Stream response from RAG Agent
        const stream = await RagAgent.streamResponse(message, kbContext, doctorContext, history);

        let fullContent = "";
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                fullContent += content;
                res.write(`data: ${JSON.stringify({ type: 'content', delta: content })}\n\n`);
            }
        }

        // 6. Check for completion -> Token Generation
        if (fullContent.toLowerCase().includes("all prerequisite procedures are complete")) {
            const docIdMatch = fullContent.match(/Assigned Doctor ID: ([a-f\d-]{36})/i);
            const selectedDoctorId = docIdMatch ? docIdMatch[1] : null;

            const token_number = generatePatientToken(currentThreadId, user_id);
            await chatLib.completeThread(currentThreadId, user_id, token_number, selectedDoctorId);
            res.write(`data: ${JSON.stringify({ type: 'token_generated', token: token_number, doctor_id: selectedDoctorId })}\n\n`);
        }

        // 7. DB Operations & Background Summary
        await chatLib.saveMessage(currentThreadId, 'user', message);
        await chatLib.saveMessage(currentThreadId, 'assistant', fullContent);

        // Trigger background summary
        triggerBackgroundSummary(currentThreadId);

        res.write('event: end\ndata: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Chat processing error:', error);

        // Cleanup temp file on error
        if (audioFile && fs.existsSync(audioFile.path)) {
            fs.unlinkSync(audioFile.path);
        }

        if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
            res.end();
        }
    }
};

module.exports = processMessage;
