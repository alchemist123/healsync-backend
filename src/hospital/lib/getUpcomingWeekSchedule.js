'use strict';

const { Schedule } = require('@shared/database/models');
const { Op } = require('sequelize');

function getNextMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  d.setDate(d.getDate() + daysUntilMonday);
  return d;
}

/**
 * Get schedule for the upcoming week (Monday–Sunday) for an institution.
 * @param {string} institution_id - Healthcare institution UUID
 * @returns {Promise<{ schedule: Object, week_start: string, week_end: string }>}
 */
async function getUpcomingWeekSchedule(institution_id) {
  const today = new Date();
  const weekStart = getNextMonday(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const weekEndStr = weekEnd.toISOString().slice(0, 10);

  const rows = await Schedule.findAll({
    where: {
      institution_id,
      schedule_date: { [Op.gte]: weekStartStr, [Op.lte]: weekEndStr },
      is_active: true,
    },
    include: [
      {
        association: 'doctor',
        attributes: ['id', 'first_name', 'last_name', 'specialization', 'qualification', 'experience'],
        include: [{ association: 'user', attributes: ['id', 'phone'] }],
      },
      { association: 'department', attributes: ['id', 'name'] },
    ],
    order: [
      ['schedule_date', 'ASC'],
      ['start_time', 'ASC'],
    ],
  });

  const scheduleByDept = {};
  for (const row of rows) {
    const r = row.toJSON();
    const doctor = r.doctor;
    const department = r.department;
    if (!doctor || !department) continue;

    const deptName = department.name;
    if (!scheduleByDept[deptName]) scheduleByDept[deptName] = [];

    const startTime = typeof r.start_time === 'string' ? r.start_time : (r.start_time?.toString?.() || '00:00:00').slice(0, 8);
    const endTime = typeof r.end_time === 'string' ? r.end_time : (r.end_time?.toString?.() || '06:00:00').slice(0, 8);
    const time = `${startTime} - ${endTime}`;

    scheduleByDept[deptName].push({
      doctor: {
        doctor_name: `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim(),
        id: doctor.id,
        first_name: doctor.first_name,
        last_name: doctor.last_name,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.experience,
        user: doctor.user,
        departments: [{ id: department.id, name: department.name }],
      },
      date: r.schedule_date,
      time,
    });
  }

  return {
    schedule: scheduleByDept,
    week_start: weekStartStr,
    week_end: weekEndStr,
  };
}

module.exports = getUpcomingWeekSchedule;
