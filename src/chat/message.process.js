'use strict';

const RagAgent = require('../agents/rag.agent');
const { generatePatientToken } = require('./lib/token.service');
const aai = require('../agents/llm/assemblyai');
const { triggerBackgroundSummary } = require('../workers/summarization');
const chatLib = require('./lib');
const userLib = require('../user/lib');
const hospitalLib = require('../hospital/lib');
const { validate: isUuid } = require('uuid');
const fs = require('fs');

/**
 * Main chat message processor - Standard JSON Response
 */
const processMessage = async (req, res) => {
    let { message, thread_id, user_id, is_audio, hospital_id } = req.body;
    const audioFile = req.files ? req.files.find(f => f.fieldname === 'audio' || f.fieldname === 'file') : null;
    let transcription = null;

    try {
        if (!user_id) throw new Error('user_id is required');
        if (!isUuid(user_id)) throw new Error('Invalid user_id format. Must be a UUID.');

        const user = await userLib.findById(user_id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // 1. Voice Transcription
        const audioEnabled = is_audio === true || is_audio === 'true';
        if (audioEnabled && audioFile) {
            console.log(`[Chat] Transcribing audio file: ${audioFile.path}`);
            const transcriptResponse = await aai.transcripts.transcribe({ audio: audioFile.path });
            message = transcriptResponse.text;
            transcription = message;
            if (fs.existsSync(audioFile.path)) fs.unlinkSync(audioFile.path);
        }

        if (!message) throw new Error('Message content or audio file is required');

        // Ensure thread exists
        const thread = await chatLib.getOrCreateThread(thread_id, user_id);
        const currentThreadId = thread.id;

        // 2. Context Retrieval
        const kbContext = await chatLib.getRelevantKbContext(message);
        const history = await chatLib.getRecentMessages(currentThreadId, 5);
        const scheduleData = await hospitalLib.getScheduleData(hospital_id);
        const doctorContext = JSON.stringify(scheduleData);

        // 3. AI Generation
        const agentResponse = await RagAgent.generateResponse(message, kbContext, doctorContext, history);
        const { response_message, schedule_id, token_generation } = agentResponse;

        let result = {
            type: 'content',
            message: response_message,
            transcription: transcription,
            thread_id: currentThreadId
        };

        // 4. Token Generation (Finalization)
        if (token_generation === true && schedule_id && isUuid(schedule_id)) {
            const schedule = await hospitalLib.findSchedule(schedule_id);

            if (schedule) {
                const selectedDoctorId = schedule.doctor?.user_id;
                const token_number = await generatePatientToken();

                await chatLib.completeThread(currentThreadId, user_id, token_number, selectedDoctorId, schedule_id);

                result = {
                    ...result,
                    type: 'token_generated',
                    token: token_number,
                    doctor_id: selectedDoctorId,
                    schedule_id: schedule_id
                };
            }
        }

        // 5. Persistence & Background Tasks
        await chatLib.saveMessage(currentThreadId, 'user', message);
        await chatLib.saveMessage(currentThreadId, 'assistant', response_message);
        triggerBackgroundSummary(currentThreadId);

        return res.json(result);

    } catch (error) {
        console.error('Chat processing error:', error);
        if (audioFile && fs.existsSync(audioFile.path)) fs.unlinkSync(audioFile.path);

        return res.status(500).json({
            error: error.message || 'Internal server error'
        });
    }
};

module.exports = processMessage;
