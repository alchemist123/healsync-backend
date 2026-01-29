const { Token, Sequelize } = require('../../../shared/database/models/index.js');
const { Op } = Sequelize;

module.exports = async () => {
  const token = await Token.findOne({
    where: {
      token: {
        [Op.like]: 'HY-%',
      },
    },
    order: [['createdAt', 'DESC']],
  });
  if (!token) {
    return 'HY-001';
  }
};
