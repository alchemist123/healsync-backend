const RagAgent = require('../agents/rag.agent');
const { generatePatientToken } = require('./lib/token.service');
const aai = require('../agents/llm/assemblyai');
const { triggerBackgroundSummary } = require('../workers/summarization');
const chatService = require('../services/chat.service');
const doctorService = require('../services/doctor.service');

const processMessage = async (req, res) => {
    let { message, thread_id, patient_id, is_audio } = req.body;

    // SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        if (!patient_id) {
            throw new Error('patient_id is required');
        }

        // Ensure thread exists and get full object (handles undefined thread_id)
        const thread = await chatService.getOrCreateThread(thread_id, patient_id);
        thread_id = thread.thread_id; // Ensure we use the actual ID from DB

        // 1. Voice Transcription
        if (is_audio && message.startsWith('http')) {
            const transcript = await aai.transcripts.transcribe({ audio: message });
            message = transcript.text;
            res.write(`data: ${JSON.stringify({ type: 'transcript', text: message })}\n\n`);
        }

        // 2. Vector Search / KB Retrieval
        const kbContext = await chatService.getRelevantKbContext(message);

        // 3. Get recent history for context
        const history = await chatService.getRecentMessages(thread_id, 5);

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

        // 6. Check for completion -> Token Generation with Doctor ID
        if (fullContent.toLowerCase().includes("all prerequisite procedures are complete")) {
            // Extract Doctor ID from response (looking for "Assigned Doctor ID: [ID]")
            const docIdMatch = fullContent.match(/Assigned Doctor ID: (\d+)/i);
            const selectedDoctorId = docIdMatch ? parseInt(docIdMatch[1]) : null;

            const token_number = generatePatientToken(thread_id, patient_id);
            await chatService.completeThread(thread_id, patient_id, token_number, selectedDoctorId);
            res.write(`data: ${JSON.stringify({ type: 'token_generated', token: token_number, doctor_id: selectedDoctorId })}\n\n`);
        }

        // 7. DB Operations & Background Summary
        await chatService.saveMessage(thread_id, 'user', message);
        await chatService.saveMessage(thread_id, 'assistant', fullContent);

        // Trigger background summary
        triggerBackgroundSummary(thread_id);

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
