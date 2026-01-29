'use strict';

const { Summary } = require('../../../shared/database/models');
const { generateEmbedding } = require('../../services/embedding.service');

/**
 * Save conversation summary with embedding
 */
module.exports = async (thread_id, content) => {
    try {
        const embedding = await generateEmbedding(content);
        return await Summary.create({ thread_id, content, embedding });
    } catch (error) {
        console.error('Summary Save Error:', error);
        // fallback to save without embedding if embedding fails
        return await Summary.create({ thread_id, content });
    }
};
