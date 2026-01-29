'use strict';

const { Schedule } = require('@shared/database/models');
const { Op } = require('sequelize');

const SHIFT_TYPES = {
  morning: { start: '06:00', end: '12:00' },
  afternoon: { start: '12:00', end: '18:00' },
  night: { start: '18:00', end: '24:00' },
};

function timeToMinutes(str) {
  if (!str) return 0;
  const s = String(str).slice(0, 8);
  const [h, m] = s.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function shiftMatchesType(startTimeStr, shiftType) {
  if (!shiftType || shiftType === 'all') return true;
  const range = SHIFT_TYPES[shiftType];
  if (!range) return true;
  const startM = timeToMinutes(startTimeStr);
  const rangeStartM = timeToMinutes(range.start);
  const rangeEndM = timeToMinutes(range.end);
  if (shiftType === 'night') {
    return startM >= rangeStartM || startM < 6 * 60;
  }
  if (rangeEndM > rangeStartM) {
    return startM >= rangeStartM && startM < rangeEndM;
  }
  return startM >= rangeStartM || startM < rangeEndM;
}

function formatTime(val) {
  if (typeof val === 'string') return val.slice(0, 8);
  if (val && typeof val === 'object' && val.toString) return val.toString().slice(0, 8);
  return '00:00:00';
}

/**
 * Get today's shifts for an institution with doctor details and time.
 * @param {string} institution_id - Healthcare institution UUID
 * @param {string} shift_type - 'all' | 'morning' | 'afternoon' | 'night'
 * @returns {Promise<{ date: string, shift_type: string, shifts: Array }>}
 */
async function getTodayShifts(institution_id, shift_type = 'all') {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const rows = await Schedule.findAll({
    where: {
      institution_id,
      schedule_date: todayStr,
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
      ['start_time', 'ASC'],
    ],
  });

  const normalizedType = (shift_type || 'all').toLowerCase().trim();
  const shifts = [];

  for (const row of rows) {
    const r = row.toJSON();
    const startTimeStr = formatTime(r.start_time);
    if (!shiftMatchesType(startTimeStr, normalizedType)) continue;

    const doctor = r.doctor;
    const department = r.department;
    const startTime = formatTime(r.start_time);
    const endTime = formatTime(r.end_time);

    shifts.push({
      id: r.id,
      doctor: doctor
        ? {
            id: doctor.id,
            first_name: doctor.first_name,
            last_name: doctor.last_name,
            doctor_name: `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim(),
            specialization: doctor.specialization,
            qualification: doctor.qualification,
            experience: doctor.experience,
            user: doctor.user,
          }
        : null,
      department: department ? { id: department.id, name: department.name } : null,
      date: r.schedule_date,
      start_time: startTime,
      end_time: endTime,
      time: `${startTime} - ${endTime}`,
      max_appointments: r.max_appointments ?? 10,
    });
  }

  return {
    date: todayStr,
    shift_type: normalizedType,
    shifts,
  };
}

module.exports = getTodayShifts;
