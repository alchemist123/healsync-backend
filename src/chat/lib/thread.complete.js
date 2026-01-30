'use strict';

const { Thread, Token, sequelize } = require('../../../shared/database/models');
const completeActiveTokens = require('../../patiant/lib/token.complete.active');

/**
 * Mark thread as completed and generate a token record
 */
module.exports = async (thread_id, user_id, token_number, doctor_id = null, schedule_id = null) => {
    const transaction = await sequelize.transaction();

    try {
        // Update thread status
        await Thread.update(
            { status: 'completed' },
            { where: { id: thread_id }, transaction }
        );

        // If doctor is assigned, complete any previous active tokens for this doctor/patient pair
        if (doctor_id) {
            await completeActiveTokens(user_id, doctor_id, { transaction });
        }

        // Create token record
        const token = await Token.create({
            token_number,
            thread_id,
            patient_id: user_id,
            status: 'active',
            appointment_date: new Date(),
            doctor_id: doctor_id,
            schedule_id: schedule_id
        }, { transaction });

        await transaction.commit();
        return token;
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Thread Completion Error:', error);
        throw error;
    }
};
