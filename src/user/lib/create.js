const { User } = require('@shared/database/models');

module.exports = async (param) => {
  const result = await User.create(param);
  return result;
};