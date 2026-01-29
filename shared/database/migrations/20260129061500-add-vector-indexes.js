'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Index for summaries
        await queryInterface.sequelize.query(`
            CREATE INDEX IF NOT EXISTS summaries_embedding_idx
            ON summaries
            USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100);
        `);

        // Index for medical_knowledge
        await queryInterface.sequelize.query(`
            CREATE INDEX IF NOT EXISTS medical_knowledge_embedding_idx
            ON medical_knowledge
            USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100);
        `);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
            DROP INDEX IF EXISTS summaries_embedding_idx;
        `);
        await queryInterface.sequelize.query(`
            DROP INDEX IF EXISTS medical_knowledge_embedding_idx;
        `);
    }
};
