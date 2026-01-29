'use strict';

const { Schedule, Department } = require('@shared/database/models');
const { Op } = require('sequelize');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDayOfWeek(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return DAY_NAMES[d.getDay()];
}

/**
 * Parse time string "00:00:00 - 06:00:00" into { start_time, end_time }.
 */
function parseTimeRange(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return { start_time: '00:00:00', end_time: '06:00:00' };
  const parts = timeStr.split(/\s*-\s*/).map((p) => p.trim());
  return {
    start_time: parts[0] || '00:00:00',
    end_time: parts[1] || '06:00:00',
  };
}

/**
 * Persist a duty schedule payload to consultation.schedules.
 * Requires institution_id. When saving, old schedules for that institution in the week are set inactive; new rows are active.
 * @param {Object} payload - { institution_id, schedule: { "Cardiology": [ { doctor: { id }, date, time } ], ... }, week_start, week_end }
 * @param {boolean} replaceWeek - If true, mark existing schedules for this institution in week_start..week_end as inactive before inserting
 * @returns {Promise<{ created: number, schedule_ids: string[], inactivated: number }>}
 */
async function saveSchedule(payload, replaceWeek = true) {
  const institution_id = payload.institution_id;
  if (!institution_id) {
    const err = new Error('institution_id is required');
    err.code = 'MISSING_INSTITUTION_ID';
    throw err;
  }

  const scheduleByDept = payload.schedule || {};
  const weekStart = payload.week_start;
  const weekEnd = payload.week_end;

  const departments = await Department.findAll({ attributes: ['id', 'name'] });
  const deptNameToId = new Map(departments.map((d) => [d.name, d.id]));

  let inactivated = 0;
  if (replaceWeek && weekStart && weekEnd) {
    const [count] = await Schedule.update(
      { is_active: false },
      {
        where: {
          institution_id,
          schedule_date: { [Op.gte]: weekStart, [Op.lte]: weekEnd },
        },
      },
    );
    inactivated = count;
  }

  const rows = [];
  for (const [deptName, slots] of Object.entries(scheduleByDept)) {
    const department_id = deptNameToId.get(deptName);
    if (!department_id) continue;

    const slotList = Array.isArray(slots) ? slots : [];
    for (const slot of slotList) {
      const doctorId = slot?.doctor?.id;
      if (!doctorId) continue;

      const date = slot.date;
      const time = slot.time;
      if (!date) continue;

      const { start_time, end_time } = parseTimeRange(time);
      const day_of_week = getDayOfWeek(date);

      rows.push({
        institution_id,
        doctor_id: doctorId,
        department_id,
        schedule_date: date,
        day_of_week,
        start_time,
        end_time,
        max_appointments: 10,
        is_active: true,
      });
    }
  }

  const created = await Schedule.bulkCreate(rows);
  return {
    created: created.length,
    schedule_ids: created.map((c) => c.id),
    inactivated,
  };
}

module.exports = saveSchedule;
