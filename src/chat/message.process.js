'use strict';

const RagAgent = require('../agents/rag.agent');
const StageAnalyzerAgent = require('../agents/stage_analyzer.agent');
const { generatePatientToken } = require('./lib/token.service');
const aai = require('../agents/llm/assemblyai');
const { triggerBackgroundSummary } = require('../workers/summarization');
const chatLib = require('./lib');
const userLib = require('../user/lib');
const hospitalLib = require('../hospital/lib');
const { validate: isUuid } = require('uuid');
const fs = require('fs');

/**
 * Main chat message processor with Multi-Stage Agentic Flow
 */
const processMessage = async (req, res) => {
    let { message, thread_id, user_id, is_audio, hospital_id } = req.body;
    const audioFile = req.files ? req.files.find(f => f.fieldname === 'audio' || f.fieldname === 'file') : null;

    // SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        if (!user_id) throw new Error('user_id is required');
        if (!isUuid(user_id)) throw new Error('Invalid user_id format.');

        const user = await userLib.findById(user_id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // 1. Voice Transcription
        const audioEnabled = is_audio === true || is_audio === 'true';
        if (audioEnabled && audioFile) {
            console.log(`[Chat] Transcribing audio file: ${audioFile.path}`);
            const transcript = await aai.transcripts.transcribe({ audio: audioFile.path });
            message = transcript.text;
            res.write(`data: ${JSON.stringify({ type: 'transcript', text: message })}\n\n`);
            if (fs.existsSync(audioFile.path)) fs.unlinkSync(audioFile.path);
        }

        if (!message) throw new Error('Message content or audio file is required');

        // Ensure thread exists
        const thread = await chatLib.getOrCreateThread(thread_id, user_id);
        const currentThreadId = thread.id;

        // 2. Fetch Context Data
        // - History (last 5 messages)
        const history = await chatLib.getRecentMessages(currentThreadId, 5);

        // - Available Doctors
        const doctors = await hospitalLib.listDoctors(hospital_id);
        const doctorContext = doctors.map(d => {
            const departments = (d.joined_departments || []).map(jd => jd.department?.name).filter(Boolean).join(', ');
            return `- [Doctor ID: ${d.user_id}] Dr. ${d.first_name} ${d.last_name} (${departments}): Specialized in ${d.specialization}.`;
        }).join('\n');

        // 3. Stage Analysis
        const stage = await StageAnalyzerAgent.analyzeStage(message, history, doctorContext);
        console.log(`[Chat] Detected Stage: ${stage}`);

        // 4. Gather Stage-Specific Context
        const stageContext = {};

        if (stage === 'SYMPTOMS') {
            stageContext.kbContext = await chatLib.getRelevantKbContext(message);
        }

        if (stage === 'DOCTOR_ID') {
            stageContext.doctorContext = doctorContext;
        }

        if (stage === 'SCHEDULING' || stage === 'TOKEN_GENERATION') {
            const schedules = await hospitalLib.scheduleList({ institution_id: hospital_id });
            stageContext.scheduleContext = schedules.map(s =>
                `- doctor_id: ${s.doctor.user_id} doctor_name: Dr. ${s.doctor.first_name} ${s.doctor.last_name},doctor_specialization: ${s.doctor.specialization}, schedule_date: ${s.schedule_date}, schedule_time: ${s.start_time}-${s.end_time}`
            ).join('\n');
            stageContext.doctorContext = doctorContext;



        }

        console.log("\nStage Context: ", JSON.stringify(stageContext));

        // 5. Generate Multi-Stage Response
        const agentResponse = await RagAgent.generateResponse(message, stage, stageContext, history);
        console.log("Agent Response: ", JSON.stringify(agentResponse));
        const { response_message, doctor_id, token_generation, selected_date, selected_time } = agentResponse;

        // 6. Handle Special Transitions
        const isValidTokenRequest = token_generation === true && doctor_id && isUuid(doctor_id);

        if (isValidTokenRequest) {
            const token_number = await generatePatientToken();
            await chatLib.completeThread(currentThreadId, user_id, token_number, doctor_id);

            res.write(`data: ${JSON.stringify({
                type: 'token_generated',
                token: token_number,
                doctor_id,
                message: response_message,
                appointment_date: selected_date,
                appointment_time: selected_time
            })}\n\n`);
        } else {
            // If the AI accidentally set token_generation true without a valid doctor_id
            let finalMessage = response_message;
            if (token_generation === true && !doctor_id) {
                finalMessage = "I'm almost ready to generate your token, but I need to finalize the doctor assignment. Could you please confirm the doctor?";
            }
            res.write(`data: ${JSON.stringify({ type: 'content', message: finalMessage, stage })}\n\n`);
        }

        // 7. DB Operations & Persistence
        await chatLib.saveMessage(currentThreadId, 'user', message);
        await chatLib.saveMessage(currentThreadId, 'assistant', response_message);
        triggerBackgroundSummary(currentThreadId);

        res.write('event: end\ndata: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Chat processing error:', error);
        if (audioFile && fs.existsSync(audioFile.path)) fs.unlinkSync(audioFile.path);
        if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
            res.end();
        }
    }
};

module.exports = processMessage;
