'use strict';

const { MedicalKnowledge, sequelize } = require('../../../shared/database/models');
const { generateEmbedding } = require('../../services/embedding.service');

/**
 * Search medical knowledge base using vector similarity
 */
module.exports = async (query, limit = 3) => {
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
};
