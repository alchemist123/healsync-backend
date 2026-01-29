'use strict';

const RagAgent = require('../agents/rag.agent');
const { generatePatientToken } = require('./lib/token.service');
const aai = require('../agents/llm/assemblyai');
const { triggerBackgroundSummary } = require('../workers/summarization');
const chatLib = require('./lib');
const userLib = require('../user/lib');
const hospitalLib = require('../hospital/lib');
const doctorService = require('../services/doctor.service');
const { validate: isUuid } = require('uuid');
const fs = require('fs');

/**
 * Main chat message processor
 */
const processMessage = async (req, res) => {
    let { message, thread_id, user_id, is_audio, hospital_id } = req.body;
    const audioFile = req.files ? req.files.find(f => f.fieldname === 'audio' || f.fieldname === 'file') : null;

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

        const user = await userLib.findById(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 1. Voice Transcription if is_audio is true
        const audioEnabled = is_audio === true || is_audio === 'true';

        if (audioEnabled && audioFile) {
            console.log(`[Chat] Transcribing audio file: ${audioFile.path}`);
            const transcript = await aai.transcripts.transcribe({
                audio: audioFile.path
            });
            message = transcript.text;
            res.write(`data: ${JSON.stringify({ type: 'transcript', text: message })}\n\n`);

            if (fs.existsSync(audioFile.path)) {
                fs.unlinkSync(audioFile.path);
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

        // 4. Get Available Doctors Context from Database
        const doctors = await hospitalLib.doctorList(hospital_id);
        const doctorContext = doctors.map(d => {
            const departments = (d.joined_departments || []).map(jd => jd.department?.name).filter(Boolean).join(', ');
            return `- [Doctor ID: ${d.user_id}] Dr. ${d.first_name} ${d.last_name} (${departments}): Specialized in ${d.specialization}. Qualification: ${d.qualification}.`;
        }).join('\n');

        // 5. Get response from RAG Agent (JSON format)
        const agentResponse = await RagAgent.generateResponse(message, kbContext, doctorContext, history);

        const { response_message, doctor_id, token_generation } = agentResponse;



        // 6. Check for completion -> Token Generation
        if (token_generation === true) {
            const selectedDoctorId = doctor_id && isUuid(doctor_id) ? doctor_id : null;

            // generatePatientToken is now async
            const token_number = await generatePatientToken();

            await chatLib.completeThread(currentThreadId, user_id, token_number, selectedDoctorId);
            res.write(`data: ${JSON.stringify({ type: 'token_generated', token: token_number, doctor_id: selectedDoctorId, message: response_message })}\n\n`);
        }
        else {
            // Write content to SSE
            res.write(`data: ${JSON.stringify({ type: 'content', message: response_message })}\n\n`);
        }

        // 7. DB Operations & Background Summary
        await chatLib.saveMessage(currentThreadId, 'user', message);
        await chatLib.saveMessage(currentThreadId, 'assistant', response_message);

        // Trigger background summary
        triggerBackgroundSummary(currentThreadId);

        res.write('event: end\ndata: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Chat processing error:', error);

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
