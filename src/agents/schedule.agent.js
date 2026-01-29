'use strict';

const openai = require('./llm/openai');
const logger = require('@shared/utilities/logger');

const MODEL = process.env.OPEN_AI_MODEL || 'gpt-4o-mini';

/**
 * Use AI to parse natural-language custom_commands into structured shift adjustments.
 * e.g. "last week dr arun worked 2 shifts extra so adjust" -> { doctor_id: uuid, shift_adjustment: -2 }
 *
 * @param {string} commands - Raw command text from the user
 * @param {Array<{id: string, first_name: string, last_name: string}>} doctors - List of doctors (id, first_name, last_name)
 * @returns {Promise<Map<string, number>>} doctor_id -> shift adjustment (negative = fewer shifts this week)
 */
async function parseCommandAdjustmentsWithAI(commands, doctors) {
  const adjustments = new Map();
  if (!commands || typeof commands !== 'string' || !doctors?.length) return adjustments;

  const doctorList = doctors.map((d) => ({
    id: d.id,
    first_name: d.first_name,
    last_name: d.last_name,
    display: `${d.first_name} ${d.last_name}`.trim(),
  }));

  const systemPrompt = `You are a duty-schedule assistant. Parse the user's custom instructions about last week's overtime or special requests.
Output ONLY valid JSON, no other text. Format: { "adjustments": [ { "doctor_id": "<uuid>", "shift_adjustment": <number> } ] }
- shift_adjustment: negative number if the doctor worked EXTRA last week (give them fewer shifts this week). e.g. -2 means give 2 fewer shifts.
- Match doctor names from the list (use first_name, last_name, or "dr first_name"). Pick the exact doctor_id from the list.
- If you cannot match a name to a doctor in the list, omit that adjustment.
- Return only doctors mentioned in the instructions.`;

  const userPrompt = `Doctors (use these exact ids):\n${JSON.stringify(doctorList)}\n\nUser instructions:\n${commands}\n\nOutput JSON only:`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
    });

    const content = response.choices?.[0]?.message?.content?.trim() || '';
    const doctorIds = new Set(doctors.map((d) => d.id));

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const codeMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeMatch) jsonStr = codeMatch[1].trim();
    const parsed = JSON.parse(jsonStr);

    const list = Array.isArray(parsed.adjustments) ? parsed.adjustments : [];
    for (const item of list) {
      if (doctorIds.has(item.doctor_id) && typeof item.shift_adjustment === 'number') {
        adjustments.set(item.doctor_id, item.shift_adjustment);
      }
    }
    return adjustments;
  } catch (err) {
    logger.warn('schedule agent parseCommandAdjustmentsWithAI failed', { error: err?.message });
    return adjustments;
  }
}

/**
 * Use AI to generate a full weekly duty schedule given doctors, departments, slots, and constraints.
 * Returns schedule_by_department structure. Invalid or over-assigned entries are corrected by validation.
 *
 * @param {Object} params
 * @param {Array} params.doctors - Full doctor list (id, first_name, last_name, experience, departments)
 * @param {Array} params.departments - [{ id, name, doctorIds }]
 * @param {Array} params.weekSlots - [{ date, start_time, end_time }] (e.g. 28 slots for 7 days * 4 shifts)
 * @param {Object} params.config - max_weekly_hours, min_rest_period_hours, duty_time_hours, fairness_weighted, seniority_buffer, trainee_oversight
 * @param {string} params.custom_commands - Natural language instructions
 * @param {Map<string, number>} params.commandAdjustments - Pre-parsed adjustments (doctor_id -> shift_adjustment)
 * @returns {Promise<{ schedule_by_department: Array, ai_used: boolean }>}
 */
async function generateScheduleWithAI(params) {
  const { doctors, departments, weekSlots, config, custom_commands, commandAdjustments } = params;
  const scheduleByDepartment = departments.map((d) => ({
    department_id: d.id,
    department_name: d.name,
    slots: weekSlots.map((slot) => ({
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      doctor_id: null,
      doctor_name: null,
      unassigned: true,
    })),
  }));

  const doctorSummaries = doctors.map((d) => ({
    id: d.id,
    name: `${d.first_name} ${d.last_name}`.trim(),
    experience: d.experience ?? 0,
    department_ids: (d.departments || []).map((dept) => dept.id),
  }));

  const deptSummaries = departments.map((d) => ({
    id: d.id,
    name: d.name,
    doctor_ids: d.doctorIds,
  }));

  const slotSummaries = weekSlots.map((s, i) => ({
    index: i,
    date: s.date,
    start_time: s.start_time,
    end_time: s.end_time,
  }));

  const systemPrompt = `You are a hospital duty scheduler. Assign one doctor per slot per department.
Rules: max ${config.max_weekly_hours} hours per doctor per week (${config.max_weekly_hours / config.duty_time_hours} shifts), min ${config.min_rest_period_hours}h rest between shifts, fairness: distribute evenly. Seniors (experience >= ${config.seniority_buffer} years) get 1 fewer shift. Trainees (experience < 3) avoid night shifts (00-06, 18-24) when possible.
Output ONLY valid JSON: { "assignments": [ { "department_id": "<uuid>", "slot_index": <0..n>, "doctor_id": "<uuid>" } ] }. One entry per (department, slot). Only use doctor_ids that belong to that department.`;

  const userPrompt = `Departments and their doctor_ids:\n${JSON.stringify(deptSummaries)}\n\nDoctors:\n${JSON.stringify(doctorSummaries)}\n\nSlots (slot_index 0 to ${weekSlots.length - 1}):\n${JSON.stringify(slotSummaries)}\n\nCustom instructions: ${custom_commands || 'None'}\nPre-computed shift adjustments (give these doctors fewer shifts): ${JSON.stringify([...commandAdjustments.entries()])}\n\nOutput JSON only:`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
    });

    const content = response.choices?.[0]?.message?.content?.trim() || '';
    let jsonStr = content;
    const codeMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeMatch) jsonStr = codeMatch[1].trim();
    const parsed = JSON.parse(jsonStr);

    const assignments = Array.isArray(parsed.assignments) ? parsed.assignments : [];
    const deptIndex = new Map(departments.map((d, i) => [d.id, { dept: d, scheduleIndex: i }]));
    const doctorsById = new Map(doctors.map((d) => [d.id, d]));

    const shiftsPerDoctor = new Map();
    const lastShiftEndByDoctor = new Map();

    for (const a of assignments) {
      const deptInfo = deptIndex.get(a.department_id);
      if (!deptInfo || a.slot_index < 0 || a.slot_index >= weekSlots.length) continue;
      if (!deptInfo.dept.doctorIds.includes(a.doctor_id)) continue;

      const slot = weekSlots[a.slot_index];
      const doctor = doctorsById.get(a.doctor_id);
      if (!doctor) continue;

      const baseMax = Math.floor(config.max_weekly_hours / config.duty_time_hours);
      const exp = doctor.experience ?? 0;
      const experienceBonus = Math.min(2, Math.floor(exp / 10));
      const seniorReduction = exp >= (config.seniority_buffer ?? 10) ? 1 : 0;
      const maxShiftsForDoctor = Math.max(0, baseMax + experienceBonus - seniorReduction);
      const adj = commandAdjustments.get(a.doctor_id) || 0;
      const maxShifts = Math.max(0, maxShiftsForDoctor + adj);
      const current = (shiftsPerDoctor.get(a.doctor_id) || 0) + 1;
      if (current > maxShifts) continue;

      const slotStart = new Date(`${slot.date}T${slot.start_time}`);
      const lastEnd = lastShiftEndByDoctor.get(a.doctor_id);
      if (lastEnd) {
        const restMs = slotStart.getTime() - lastEnd.getTime();
        if (restMs < config.min_rest_period_hours * 60 * 60 * 1000) continue;
      }

      const schedule = scheduleByDepartment[deptInfo.scheduleIndex];
      const slotEntry = schedule.slots[a.slot_index];
      slotEntry.doctor_id = doctor.id;
      slotEntry.doctor_name = `${doctor.first_name} ${doctor.last_name}`.trim();
      slotEntry.unassigned = false;

      shiftsPerDoctor.set(a.doctor_id, current);
      lastShiftEndByDoctor.set(a.doctor_id, new Date(`${slot.date}T${slot.end_time}`));
    }

    return { schedule_by_department: scheduleByDepartment, ai_used: true };
  } catch (err) {
    logger.warn('schedule agent generateScheduleWithAI failed', { error: err?.message });
    return { schedule_by_department: null, ai_used: false };
  }
}

module.exports = {
  parseCommandAdjustmentsWithAI,
  generateScheduleWithAI,
};
