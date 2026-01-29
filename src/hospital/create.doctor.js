const user = require('../user/lib');
const logger = require('@shared/utilities/logger');
const hospital = require('./lib');

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUUID(value) {
  if (value == null) return false;
  return UUID_REGEX.test(String(value).trim());
}

module.exports = async (req, res) => {
  try {
    const body = req.body || {};
    const { first_name, last_name, specialization, qualification, license_number, department_id, institution_id, experience } = body;

    if (!isValidUUID(institution_id)) {
      return res.status(400).json({ message: 'Invalid institution_id: must be a valid UUID (e.g. 8 hex chars-4-4-4-12)' });
    }
    const deptIds = Array.isArray(department_id) ? department_id : [department_id];
    for (const id of deptIds) {
      if (!isValidUUID(id)) {
        return res.status(400).json({ message: 'Invalid department_id: each value must be a valid UUID (only 0-9 and a-f)' });
      }
    }

    let User = await user.find(body.phone, body.aadhaar_number, 'doctor');
    if (!User) {
      User = await user.create({ phone: body.phone, aadhaar_number: body.aadhaar_number, user_type: 'doctor' });
    }
    const param = {
      user_id: User.id,
      first_name,
      last_name,
      specialization,
      qualification,
      license_number,
      experience,
    };
    const result = await hospital.addDoctor(param);
    const mappings = await hospital.mapDept(institution_id, deptIds, result.id);
    return res.json({ result, mappings });
  } catch (error) {
    logger.error('hospital create doctor error', { error: error?.message, stack: error?.stack });
    return res.status(500).json({ message: 'Internal server error' });
  }
};