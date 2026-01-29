const { Doctor } = require('@shared/database/models');
module.exports = async (param) => {
  const result = await Doctor.create(param);
  return result;
};