'use strict';

const { Schedule, Department, Doctor } = require('../../../shared/database/models');

/**
 * List schedules, optionally filtered by doctor_id or institution_id
 */
module.exports = async (filter = {}) => {
    const where = { is_active: true };
    if (filter.doctor_id) where.doctor_id = filter.doctor_id;
    if (filter.institution_id) where.institution_id = filter.institution_id;

    return await Schedule.findAll({
        where,
        include: [
            {
                association: 'doctor',
                attributes: ['id', 'user_id', 'first_name', 'last_name', 'specialization', 'qualification'],
            },
            {
                association: 'department',
                attributes: ['id', 'name'],
            },
        ],
        order: [['schedule_date', 'ASC'], ['start_time', 'ASC']],
    });
};
