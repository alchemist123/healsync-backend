'use strict';

const { Schedule, Token } = require('@shared/database/models');
const { Op } = require('sequelize');

function getNextMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  d.setDate(d.getDate() + daysUntilMonday);
  return d;
}

function formatTime(val) {
  if (typeof val === 'string') return val.slice(0, 8);
  if (val && typeof val === 'object' && val.toString) return val.toString().slice(0, 8);
  return '00:00:00';
}

/**
 * Get schedule data grouped by department and doctor with slots.
 * @param {string} institution_id - Healthcare institution UUID
 * @param {Object} options - Optional { week_start, week_end } (YYYY-MM-DD). If omitted, uses upcoming week.
 * @returns {Promise<Array<{ departments: string, doctor_name: string, doctor_id: string, slots: Array<{ date: string, start_time: string, end_time: string, token_count: number }> }>>}
 */
async function getScheduleData(institution_id, options = {}) {
  let weekStartStr = options.week_start;
  let weekEndStr = options.week_end;

  if (!weekStartStr || !weekEndStr) {
    const today = new Date();
    const weekStart = getNextMonday(today);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekStartStr = weekStart.toISOString().slice(0, 10);
    weekEndStr = weekEnd.toISOString().slice(0, 10);
  }

  const rows = await Schedule.findAll({
    where: {
      institution_id,
      schedule_date: { [Op.gte]: weekStartStr, [Op.lte]: weekEndStr },
      is_active: true,
    },
    include: [
      {
        association: 'doctor',
        attributes: ['id', 'first_name', 'last_name'],
      },
      { association: 'department', attributes: ['id', 'name'] },
    ],
    order: [
      ['schedule_date', 'ASC'],
      ['start_time', 'ASC'],
    ],
  });

  const scheduleIds = [...new Set(rows.map((row) => row.toJSON().id).filter(Boolean))];
  const tokenCountByScheduleId = new Map();

  if (scheduleIds.length > 0) {
    const tokenRows = await Token.findAll({
      where: { schedule_id: { [Op.in]: scheduleIds } },
      attributes: ['schedule_id'],
      raw: true,
    });
    for (const t of tokenRows) {
      const sid = t.schedule_id;
      if (sid) tokenCountByScheduleId.set(sid, (tokenCountByScheduleId.get(sid) || 0) + 1);
    }
  }

  const keyToEntry = new Map();

  for (const row of rows) {
    const r = row.toJSON();
    const doctor = r.doctor;
    const department = r.department;
    if (!doctor || !department) continue;

    const doctor_id = String(doctor.id);
    const departments = department.name;
    const key = `${departments}|${doctor_id}`;

    if (!keyToEntry.has(key)) {
      keyToEntry.set(key, {
        departments,
        doctor_name: `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim(),
        doctor_id,
        slots: [],
      });
    }

    const entry = keyToEntry.get(key);
    entry.slots.push({
      date: r.schedule_date,
      start_time: formatTime(r.start_time),
      end_time: formatTime(r.end_time),
      token_count: tokenCountByScheduleId.get(r.id) ?? 0,
    });
  }

  return Array.from(keyToEntry.values());
}

module.exports = getScheduleData;
