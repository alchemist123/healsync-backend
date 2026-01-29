const { User } = require('@shared/database/models');

module.exports = async (phone, aadhaar_number, user_type) => {
  const result = await User.findOne({ where: { phone, aadhaar_number, user_type } });
  return result;
};