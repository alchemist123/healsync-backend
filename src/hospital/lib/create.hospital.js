const { HealthcareInstitution } = require('@shared/database/models');

module.exports = async (param) => {
  const result = await HealthcareInstitution.create(param);
  return result;
};