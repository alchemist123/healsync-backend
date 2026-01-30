'use strict';

const { Schedule, Doctor } = require('../../../shared/database/models');

/**
 * Find a schedule by its ID, including the associated doctor
 * @param {string} id - The UUID of the schedule
 */
module.exports = async (id) => {
    if (!id) throw new Error('Schedule ID is required');

    return await Schedule.findByPk(id, {
        include: [
            {
                association: 'doctor',
                attributes: ['id', 'user_id', 'first_name', 'last_name'],
            }
        ]
    });
};
