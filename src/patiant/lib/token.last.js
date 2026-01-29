const { Token, Sequelize } = require('../../../shared/database/models/index.js');
const { Op } = Sequelize;

module.exports = async () => {
  return await Token.findOne({
    where: {
      token: {
        [Op.like]: 'HY-%',
      },
    },
    order: [['createdAt', 'DESC']],
  });
};
