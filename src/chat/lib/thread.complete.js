'use strict';

const { Thread, Token, sequelize } = require('../../../shared/database/models');

/**
 * Mark thread as completed and generate a token record
 */
module.exports = async (thread_id, user_id, token_number, doctor_id = null) => {
    const transaction = await sequelize.transaction();
    try {
        // Update thread status
        await Thread.update(
            { status: 'completed' },
            { where: { id: thread_id }, transaction }
        );

        // Create token record
        const token = await Token.create({
            token_number,
            thread_id,
            patient_id: user_id,
            status: 'active',
            issued_at: new Date(),
            doctor_id: doctor_id
        }, { transaction });

        await transaction.commit();
        return token;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
