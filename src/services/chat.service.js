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
    async getOrCreateThread(threadId, patientId) {
        if (!threadId) {
            return await this.getActiveThread(patientId);
        }
        let [thread] = await Thread.findOrCreate({
            where: { threadId },
            defaults: { patientId }
        });
        return thread;
    }

    /**
     * Get the current active thread for a patient or create a new one
     */
    async getActiveThread(patientId) {
        let thread = await Thread.findOne({
            where: {
                patientId,
                status: 'active'
            },
            order: [['created_at', 'DESC']]
        });

        if (!thread) {
            const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            thread = await Thread.create({
                threadId,
                patientId,
                status: 'active'
            });
        }
        return thread;
    }

    /**
     * Save a chat message
     */
    async saveMessage(threadId, role, content) {
        return await Message.create({ threadId, role, content });
    }

    /**
     * Get message count for a thread
     */
    async getMessageCount(threadId) {
        return await Message.count({ where: { threadId } });
    }

    /**
     * Get recent messages for a thread
     */
    async getRecentMessages(threadId, limit = 5) {
        const messages = await Message.findAll({
            where: { threadId },
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
            // <-> is Euclidean distance, <=> is cosine distance (similarity = 1 - distance)
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
    async saveSummary(threadId, content) {
        try {
            const embedding = await generateEmbedding(content);
            return await Summary.create({ threadId, content, embedding });
        } catch (error) {
            console.error('Summary Save Error:', error);
            // fallback to save without embedding if embedding fails
            return await Summary.create({ threadId, content });
        }
    }

    /**
     * Mark thread as completed and generate a token record
     */
    async completeThread(threadId, patientId, tokenNumber) {
        const transaction = await sequelize.transaction();
        try {
            // Update thread status
            await Thread.update(
                { status: 'completed' },
                { where: { threadId }, transaction }
            );

            // Create token record
            const token = await Token.create({
                tokenNumber,
                threadId,
                patientId: parseInt(patientId), // Ensure it's an integer as per schema
                status: 'issued',
                issuedAt: new Date()
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
