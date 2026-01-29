const { Thread, Message, Summary, MedicalKnowledge, Token, sequelize } = require('../../shared/database/models');
const { generateEmbedding } = require('./embedding.service');
const { Op } = require('sequelize');

/**
 * Service to handle chat-related database operations
 */
class ChatService {
    /**
     * Find or create a thread
     */
    async getOrCreateThread(thread_id, patient_id) {
        if (!thread_id) {
            return await this.getActiveThread(patient_id);
        }
        let [thread] = await Thread.findOrCreate({
            where: { thread_id },
            defaults: { patient_id }
        });
        return thread;
    }

    /**
     * Get the current active thread for a patient or create a new one
     */
    async getActiveThread(patient_id) {
        let thread = await Thread.findOne({
            where: {
                patient_id,
                status: 'active'
            },
            order: [['created_at', 'DESC']]
        });

        if (!thread) {
            const thread_id = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            thread = await Thread.create({
                thread_id,
                patient_id,
                status: 'active'
            });
        }
        return thread;
    }

    /**
     * Save a chat message
     */
    async saveMessage(thread_id, role, content) {
        return await Message.create({ thread_id, role, content });
    }

    /**
     * Get message count for a thread
     */
    async getMessageCount(thread_id) {
        return await Message.count({ where: { thread_id } });
    }

    /**
     * Get recent messages for a thread
     */
    async getRecentMessages(thread_id, limit = 5) {
        const messages = await Message.findAll({
            where: { thread_id },
            order: [['created_at', 'DESC']],
            limit
        });
        return messages.reverse().map(m => ({ role: m.role, content: m.content }));
    }

    /**
     * Search medical knowledge base using vector similarity
     */
    async getRelevantKbContext(query, limit = 3) {
        try {
            const embedding = await generateEmbedding(query);
            const vectorStr = `[${embedding.join(',')}]`;

            // pgvector cosine similarity search
            const results = await MedicalKnowledge.findAll({
                attributes: [
                    'title', 'content',
                    [sequelize.literal(`embedding <=> '${vectorStr}'`), 'distance']
                ],
                order: [[sequelize.literal('distance'), 'ASC']],
                limit
            });

            if (results.length === 0) return "No relevant medical knowledge found.";

            return results.map(r => `[${r.title}]: ${r.content}`).join('\n\n');
        } catch (error) {
            console.error('KB Retrieval Error:', error);
            return "Error retrieving medical knowledge.";
        }
    }

    /**
     * Save conversation summary with embedding
     */
    async saveSummary(thread_id, content) {
        try {
            const embedding = await generateEmbedding(content);
            return await Summary.create({ thread_id, content, embedding });
        } catch (error) {
            console.error('Summary Save Error:', error);
            // fallback to save without embedding if embedding fails
            return await Summary.create({ thread_id, content });
        }
    }

    /**
     * Mark thread as completed and generate a token record
     */
    async completeThread(thread_id, patient_id, token_number, doctor_id = null) {
        const transaction = await sequelize.transaction();
        try {
            // Update thread status
            await Thread.update(
                { status: 'completed' },
                { where: { thread_id }, transaction }
            );

            // Create token record
            const token = await Token.create({
                token_number,
                thread_id,
                patient_id: patient_id,
                status: 'issued',
                issued_at: new Date(),
                doctor_id: doctor_id
            }, { transaction });

            await transaction.commit();
            return token;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new ChatService();
