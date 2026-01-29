'use strict';

/**
 * Weekly duty schedule generator. Supports rule-based scheduling and optional AI agent
 * for parsing custom_commands and/or generating the full schedule (OpenAI).
 */
const { HospitalDepartmentDoctor } = require('@shared/database/models');
const scheduleAgent = require('../../agents/schedule.agent');

const SHIFT_LABELS = ['00-06', '06-12', '12-18', '18-24'];
const SHIFT_OFFSETS_HOURS = [0, 6, 12, 18]; // start hour of each 6h shift

/**
 * Parse custom_commands string for shift adjustments.
 * e.g. "last week dr arun worked 2 shifts extra so adjust" -> { arun: -2 }
 * @param {string} commands - raw command text
 * @param {Array<{id: string, first_name: string, last_name: string}>} doctors - list of doctors for name matching
 * @returns {Map<string, number>} doctor id -> adjustment (negative = fewer shifts this week)
 */
function parseCommandAdjustments(commands, doctors) {
  const adjustments = new Map();
  if (!commands || typeof commands !== 'string' || !doctors?.length) return adjustments;

  const text = commands.toLowerCase();
  // Match patterns like "dr X worked N shift(s) extra" or "X work N shift extra"
  const shiftExtraMatch = text.match(/(?:worked?|work)\s*(\d+)\s*shift(s?)\s*extra/);
  const numExtra = shiftExtraMatch ? parseInt(shiftExtraMatch[1], 10) : 0;
  if (numExtra <= 0) return adjustments;

  for (const doc of doctors) {
    const first = (doc.first_name || '').toLowerCase();
    const last = (doc.last_name || '').toLowerCase();
    const full = `${first} ${last}`.trim();
    if (!first && !last) continue;
    // "dr arun" or "arun" or "dr arun kumar"
    if (text.includes('dr ' + first) || text.includes('dr ' + last) || text.includes(full) || text.includes(first) || text.includes(last)) {
      adjustments.set(doc.id, -(numExtra));
      break; // first matching doctor
    }
  }
  return adjustments;
}

/**
 * Get start of week (Monday) for a given date.
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 1
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Build list of (date, shiftIndex) for the week. shiftIndex 0..3 for 00-06, 06-12, 12-18, 18-24.
 */
function buildWeekSlots(weekStart, dutyTimeHours) {
  const slotsPerDay = 24 / dutyTimeHours;
  const slots = [];
  for (let day = 0; day < 7; day++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + day);
    const dateStr = d.toISOString().slice(0, 10);
    for (let s = 0; s < slotsPerDay; s++) {
      slots.push({
        date: dateStr,
        dayIndex: day,
        shiftIndex: s,
        startHour: s * dutyTimeHours,
        endHour: (s + 1) * dutyTimeHours,
      });
    }
  }
  return slots;
}

/**
 * Check if two slots are less than minRestHours apart (same doctor).
 */
function violatesRest(slot1, slot2, minRestHours) {
  const d1 = new Date(slot1.date);
  d1.setHours(slot1.startHour, 0, 0, 0);
  const end1 = new Date(slot1.date);
  end1.setHours(slot1.endHour, 0, 0, 0);
  const d2 = new Date(slot2.date);
  d2.setHours(slot2.startHour, 0, 0, 0);
  const restMs = (d2 - end1);
  return restMs < minRestHours * 60 * 60 * 1000;
}

/**
 * Is this shift index a "night" shift (18-24 or 0-6)?
 */
function isNightShift(shiftIndex, slotsPerDay) {
  return shiftIndex === 0 || shiftIndex === slotsPerDay - 1;
}

/**
 * Generate weekly duty schedule for an institution.
 *
 * @param {Object} options
 * @param {string} options.institution_id - Healthcare institution UUID
 * @param {number} options.max_weekly_hours - Max hours per doctor per week
 * @param {number} options.min_rest_period_hours - Min rest between two shifts (hours)
 * @param {boolean} options.fairness_weighted - Distribute shifts fairly (minimize variance)
 * @param {number} options.seniority_buffer - Extra buffer for seniors (reduce their max hours by this amount, or years threshold)
 * @param {boolean} options.trainee_oversight - If true, avoid assigning trainees to night shifts when possible
 * @param {number} options.duty_time_hours - Length of one shift in hours (e.g. 6)
 * @param {string} [options.custom_commands] - Free text e.g. "last week dr arun worked 2 shifts extra so adjust"
 * @param {string} [options.start_date] - ISO date string for week start; default next Monday
 * @param {boolean} [options.use_ai_agent] - If true, use AI to parse commands and try AI-generated schedule
 * @returns {Promise<{ doctors: Array, schedule_by_department: Array, ai_agent_used: boolean }>}
 */
async function generateDutySchedule(options) {
  const {
    institution_id,
    max_weekly_hours = 48,
    min_rest_period_hours = 12,
    fairness_weighted = true,
    seniority_buffer = 0,
    trainee_oversight = false,
    duty_time_hours = 6,
    custom_commands = '',
    start_date,
    use_ai_agent = false,
  } = options;

  const weekStart = start_date ? getWeekStart(new Date(start_date)) : getWeekStart(new Date());
  const weekSlots = buildWeekSlots(weekStart, duty_time_hours);
  const slotsPerDay = 24 / duty_time_hours;

  const mappings = await HospitalDepartmentDoctor.findAll({
    where: { hospital_id: institution_id },
    include: [
      {
        association: 'doctor',
        include: [{ association: 'user', attributes: ['id', 'phone'] }],
      },
      { association: 'department', attributes: ['id', 'name'] },
    ],
  });

  // No AI/LLM agent: scheduling is rule-based only (constraints + fairness).
  const emptyPayload = () => ({
    doctors: [],
    schedule_by_department: [],
    week_start: weekStart.toISOString().slice(0, 10),
    week_end: (() => {
      const end = new Date(weekStart);
      end.setDate(end.getDate() + 6);
      return end.toISOString().slice(0, 10);
    })(),
    config: {
      max_weekly_hours,
      min_rest_period_hours,
      duty_time_hours,
      fairness_weighted,
      seniority_buffer,
      trainee_oversight,
    },
    ai_agent_used: false,
    message:
      'No doctors assigned to this institution. Assign doctors to departments first using POST /hospital/doctor with this institution_id and department_id(s), then call GET /hospital/doctors?institution_id=<id> to verify.',
  });

  if (mappings.length === 0) {
    return emptyPayload();
  }

  const doctorsById = new Map();
  const departmentsMap = new Map(); // department_id -> { id, name, doctorIds: [] }

  for (const m of mappings) {
    const row = m.toJSON();
    const doc = row.doctor;
    const dept = row.department;
    if (!doc || !dept) continue;

    const doctorId = doc.id;
    if (!doctorsById.has(doctorId)) {
      doctorsById.set(doctorId, {
        id: doc.id,
        first_name: doc.first_name,
        last_name: doc.last_name,
        specialization: doc.specialization,
        qualification: doc.qualification,
        experience: doc.experience ?? 0,
        user: doc.user,
        departments: [],
      });
    }
    const doctorEntry = doctorsById.get(doctorId);
    if (!doctorEntry.departments.find((d) => d.id === dept.id)) {
      doctorEntry.departments.push({ id: dept.id, name: dept.name });
    }

    if (!departmentsMap.has(dept.id)) {
      departmentsMap.set(dept.id, { id: dept.id, name: dept.name, doctorIds: [] });
    }
    const deptEntry = departmentsMap.get(dept.id);
    if (!deptEntry.doctorIds.includes(doctorId)) deptEntry.doctorIds.push(doctorId);
  }

  const doctors = Array.from(doctorsById.values());

  let commandAdjustments;
  let aiAgentUsed = false;
  if (use_ai_agent && custom_commands) {
    try {
      commandAdjustments = await scheduleAgent.parseCommandAdjustmentsWithAI(custom_commands, doctors);
      aiAgentUsed = true;
    } catch (_) {
      commandAdjustments = parseCommandAdjustments(custom_commands, doctors);
    }
  } else {
    commandAdjustments = parseCommandAdjustments(custom_commands, doctors);
  }

  const seniorityYearsThreshold = typeof seniority_buffer === 'number' && seniority_buffer >= 0 && seniority_buffer <= 50 ? seniority_buffer : 10;
  const traineeMaxExperience = 3;

  let scheduleByDepartment = [];

  if (use_ai_agent) {
    const weekSlotsForAI = weekSlots.map((s) => ({
      date: s.date,
      start_time: `${String(s.startHour).padStart(2, '0')}:00:00`,
      end_time: `${String(s.endHour).padStart(2, '0')}:00:00`,
    }));
    const configForAI = {
      max_weekly_hours,
      min_rest_period_hours,
      duty_time_hours,
      fairness_weighted,
      seniority_buffer: seniorityYearsThreshold,
      trainee_oversight,
    };
    const departmentsForAI = Array.from(departmentsMap.values());
    const aiResult = await scheduleAgent.generateScheduleWithAI({
      doctors,
      departments: departmentsForAI,
      weekSlots: weekSlotsForAI,
      config: configForAI,
      custom_commands,
      commandAdjustments: commandAdjustments || new Map(),
    });
    if (aiResult.ai_used && aiResult.schedule_by_department && aiResult.schedule_by_department.length > 0) {
      scheduleByDepartment = aiResult.schedule_by_department;
      aiAgentUsed = true;
    }
  }

  if (scheduleByDepartment.length === 0) {

  for (const [deptId, deptInfo] of departmentsMap) {
    const doctorIds = deptInfo.doctorIds;
    const deptDoctors = doctorIds.map((id) => doctorsById.get(id)).filter(Boolean);
    if (deptDoctors.length === 0) {
      scheduleByDepartment.push({
        department_id: deptInfo.id,
        department_name: deptInfo.name,
        slots: [],
      });
      continue;
    }

    const baseMaxShifts = Math.floor(max_weekly_hours / duty_time_hours);
    const maxExperienceBonus = 2;
    const getMaxShiftsForDoctor = (doc) => {
      const experienceBonus = Math.min(maxExperienceBonus, Math.floor((doc.experience ?? 0) / 10));
      const cap = baseMaxShifts + experienceBonus;
      const seniorReduction = doc.experience >= seniorityYearsThreshold ? 1 : 0;
      return Math.max(0, cap - seniorReduction);
    };

    const shiftsAssigned = new Map(); // doctorId -> [{ date, shiftIndex, startHour, endHour }]
    const slotAssignments = []; // { date, start_time, end_time, doctor_id, doctor_name, ... }

    for (const slot of weekSlots) {
      const candidateDoctors = deptDoctors.filter((doc) => {
        const currentShifts = shiftsAssigned.get(doc.id) || [];
        const docMaxShifts = getMaxShiftsForDoctor(doc);
        const adj = commandAdjustments.get(doc.id) || 0;
        const effectiveMax = Math.max(0, docMaxShifts + adj);
        if (currentShifts.length >= effectiveMax) return false;

        if (trainee_oversight && doc.experience < traineeMaxExperience && isNightShift(slot.shiftIndex, slotsPerDay)) {
          const hasSeniorOption = deptDoctors.some(
            (d) => d.id !== doc.id && d.experience >= seniorityYearsThreshold && (shiftsAssigned.get(d.id) || []).length < getMaxShiftsForDoctor(d)
          );
          if (hasSeniorOption) return false;
        }

        for (const prev of currentShifts) {
          if (violatesRest(prev, slot, min_rest_period_hours)) return false;
        }
        return true;
      });

      if (candidateDoctors.length === 0) {
        slotAssignments.push({
          date: slot.date,
          start_time: `${String(slot.startHour).padStart(2, '0')}:00:00`,
          end_time: `${String(slot.endHour).padStart(2, '0')}:00:00`,
          doctor_id: null,
          doctor_name: null,
          unassigned: true,
        });
        continue;
      }

      let chosen = candidateDoctors[0];
      if (fairness_weighted && candidateDoctors.length > 1) {
        chosen = candidateDoctors.reduce((a, b) => {
          const countA = (shiftsAssigned.get(a.id) || []).length;
          const countB = (shiftsAssigned.get(b.id) || []).length;
          return countA <= countB ? a : b;
        });
      }

      const startTime = `${String(slot.startHour).padStart(2, '0')}:00:00`;
      const endTime = `${String(slot.endHour).padStart(2, '0')}:00:00`;
      slotAssignments.push({
        date: slot.date,
        start_time: startTime,
        end_time: endTime,
        doctor_id: chosen.id,
        doctor_name: `${chosen.first_name} ${chosen.last_name}`.trim(),
        unassigned: false,
      });

      if (!shiftsAssigned.has(chosen.id)) shiftsAssigned.set(chosen.id, []);
      shiftsAssigned.get(chosen.id).push(slot);
    }

    scheduleByDepartment.push({
      department_id: deptInfo.id,
      department_name: deptInfo.name,
      slots: slotAssignments,
    });
  }
  }

  return {
    doctors,
    schedule_by_department: scheduleByDepartment,
    week_start: weekStart.toISOString().slice(0, 10),
    week_end: (() => {
      const end = new Date(weekStart);
      end.setDate(end.getDate() + 6);
      return end.toISOString().slice(0, 10);
    })(),
    config: {
      max_weekly_hours,
      min_rest_period_hours,
      duty_time_hours,
      fairness_weighted,
      seniority_buffer,
      trainee_oversight,
    },
    ai_agent_used: aiAgentUsed,
  };
}

module.exports = generateDutySchedule;
