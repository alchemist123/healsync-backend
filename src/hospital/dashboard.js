const hospital = require('./lib');
const logger = require('@shared/utilities/logger');

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUUID(value) {
  if (value == null) return false;
  return UUID_REGEX.test(String(value).trim());
}

module.exports = async (req, res) => {
  try {
    const institution_id = req.query?.institution_id?.trim();

    if (!institution_id || !isValidUUID(institution_id)) {
      return res.status(400).json({
        message: 'institution_id is required and must be a valid UUID (query param)',
      });
    }

    const data = await hospital.getDashboard(institution_id);
    return res.json({
      institution_id,
      available_doctors: data.available_doctors,
      available_doctors_count: data.available_doctors_count,
      today_appointments: data.today_appointments,
      active_shifts: data.active_shifts,
      clinic_load_percentage: data.clinic_load_percentage,
      total_capacity_today: data.total_capacity_today,
    });
  } catch (error) {
    logger.error('hospital dashboard error', {
      error: error?.message,
      stack: error?.stack,
    });
    return res.status(500).json({ message: 'Internal server error' });
  }
};
