'use strict';

const { HospitalDepartmentDoctor, Doctor, Schedule, Token } = require('@shared/database/models');
const { Op } = require('sequelize');

/**
 * Get dashboard data for a hospital/institution: available doctors, today appointments, active shifts, clinic load %.
 * @param {string} institution_id - Healthcare institution UUID
 * @returns {Promise<{ available_doctors: Array, available_doctors_count: number, today_appointments: number, active_shifts: number, clinic_load_percentage: number }>}
 */
async function getDashboard(institution_id) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const todayStart = new Date(todayStr + 'T00:00:00.000Z');
  const tomorrowStart = new Date(today);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
  tomorrowStart.setUTCHours(0, 0, 0, 0);

  const mappings = await HospitalDepartmentDoctor.findAll({
    where: { hospital_id: institution_id },
    attributes: ['doctor_id'],
  });
  const doctorIds = [...new Set(mappings.map((m) => m.doctor_id))];

  const availableDoctors = await Doctor.findAll({
    where: {
      id: { [Op.in]: doctorIds },
      is_available: true,
    },
    attributes: ['id', 'first_name', 'last_name', 'specialization'],
    include: [{ association: 'user', attributes: ['id', 'phone'] }],
  });
  const available_doctors = availableDoctors.map((d) => {
    const doc = d.toJSON();
    return {
      id: doc.id,
      first_name: doc.first_name,
      last_name: doc.last_name,
      doctor_name: `${doc.first_name || ''} ${doc.last_name || ''}`.trim(),
      specialization: doc.specialization,
      user: doc.user,
    };
  });

  const todayAppointments = doctorIds.length
    ? await Token.count({
        where: {
          doctor_id: { [Op.in]: doctorIds },
          issued_at: { [Op.gte]: todayStart, [Op.lt]: tomorrowStart },
        },
      })
    : 0;

  const todaySchedules = await Schedule.findAll({
    where: {
      institution_id,
      schedule_date: todayStr,
      is_active: true,
    },
    attributes: ['id', 'max_appointments'],
  });
  const active_shifts = todaySchedules.length;
  const totalCapacity = todaySchedules.reduce((sum, s) => sum + (s.max_appointments ?? 10), 0);
  const clinic_load_percentage =
    totalCapacity > 0 ? Math.min(100, Math.round((todayAppointments / totalCapacity) * 100)) : 0;

  return {
    available_doctors,
    available_doctors_count: available_doctors.length,
    today_appointments: todayAppointments,
    active_shifts,
    clinic_load_percentage,
    total_capacity_today: totalCapacity,
  };
}

module.exports = getDashboard;
