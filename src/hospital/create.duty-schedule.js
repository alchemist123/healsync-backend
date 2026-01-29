const hospital = require('./lib');
const logger = require('@shared/utilities/logger');

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUUID(value) {
  if (value == null) return false;
  return UUID_REGEX.test(String(value).trim());
}

function parseNumber(value, defaultVal, min, max) {
  if (value === undefined || value === null) return defaultVal;
  const n = Number(value);
  if (Number.isNaN(n)) return defaultVal;
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

/** Replace control characters (tab, newline, etc.) with space so JSON/APIs don't error. */
function sanitizeCustomCommands(value) {
  if (value == null) return '';
  const s = String(value);
  return s.replace(/[\x00-\x1f\x7f]/g, ' ').replace(/\s+/g, ' ').trim();
}

module.exports = async (req, res) => {
  try {
    const body = req.body || {};
    const {
      institution_id,
      max_weekly_hours,
      min_rest_period_hours,
      fairness_weighted,
      seniority_buffer,
      trainee_oversight,
      duty_time_hours,
      custom_commands,
      start_date,
      use_ai_agent,
    } = body;

    if (!isValidUUID(institution_id)) {
      return res.status(400).json({
        message: 'Invalid institution_id: must be a valid UUID',
      });
    }

    const options = {
      institution_id,
      max_weekly_hours: parseNumber(max_weekly_hours, 48, 1, 168),
      min_rest_period_hours: parseNumber(min_rest_period_hours, 12, 0, 24),
      fairness_weighted: typeof fairness_weighted === 'boolean' ? fairness_weighted : Boolean(fairness_weighted),
      seniority_buffer: parseNumber(seniority_buffer, 0, 0, 100),
      trainee_oversight: typeof trainee_oversight === 'boolean' ? trainee_oversight : Boolean(trainee_oversight),
      duty_time_hours: parseNumber(duty_time_hours, 6, 1, 12),
      custom_commands: sanitizeCustomCommands(custom_commands),
      start_date: start_date && /^\d{4}-\d{2}-\d{2}$/.test(String(start_date).trim()) ? String(start_date).trim() : undefined,
      use_ai_agent: typeof use_ai_agent === 'boolean' ? use_ai_agent : Boolean(use_ai_agent),
    };

    const result = await hospital.generateDutySchedule(options);

    const doctorsById = new Map((result.doctors || []).map((d) => [d.id, d]));

    const scheduleByDepartmentName = {};
    for (const dept of result.schedule_by_department || []) {
      const key = dept.department_name || dept.department_id || 'Unknown';
      const assignedSlots = (dept.slots || []).filter((slot) => slot.doctor_id != null);
      scheduleByDepartmentName[key] = assignedSlots.map((slot) => {
        const doctor = doctorsById.get(slot.doctor_id);
        const doctorDetails = {
          doctor_name: slot.doctor_name || (doctor ? `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim() : ''),
          id: doctor?.id,
          first_name: doctor?.first_name,
          last_name: doctor?.last_name,
          specialization: doctor?.specialization,
          qualification: doctor?.qualification,
          experience: doctor?.experience,
          user: doctor?.user,
          departments: doctor?.departments,
        };

        return {
          doctor: doctorDetails,
          date: slot.date,
          time: slot.start_time && slot.end_time ? `${slot.start_time} - ${slot.end_time}` : (slot.start_time || slot.end_time || ''),
        };
      });
    }

    const response = {
      schedule: scheduleByDepartmentName,
      week_start: result.week_start,
      week_end: result.week_end,
      config: result.config,
      ai_agent_used: result.ai_agent_used,
    };
    if (result.message) response.message = result.message;
    return res.json(response);
  } catch (error) {
    logger.error('hospital create duty schedule error', {
      error: error?.message,
      stack: error?.stack,
    });
    return res.status(500).json({ message: 'Internal server error' });
  }
};
