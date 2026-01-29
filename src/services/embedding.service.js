const openai = require('../agents/llm/openai');

/**
 * Service to generate embeddings using OpenAI
 */
const generateEmbedding = async (text) => {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
            encoding_format: 'float',
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
};

module.exports = {
    generateEmbedding
};
