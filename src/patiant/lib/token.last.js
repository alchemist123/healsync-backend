const { Token, Sequelize } = require('../../../shared/database/models/index.js');
const { Op } = Sequelize;

module.exports = async () => {
  const token = await Token.findOne({
    where: {
      token_number: {
        [Op.like]: 'HY-%',
      },
    },
    order: [['created_at', 'DESC']],
  });
  return token;
};
