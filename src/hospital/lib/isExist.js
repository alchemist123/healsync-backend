const { HealthcareInstitution } = require('@shared/database/models');
module.exports = async (param) => {
  const result = await HealthcareInstitution.findOne({ where: param });
  return result ? true : false;
};