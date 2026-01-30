const tokenByDoctor = require('../patiant/lib/token.by.doctor');
const tokenCountByDoctor = require('../patiant/lib/token.count.by.doctor');

module.exports = async (req, res) => {
  try {
    const { user } = req;

    const todayTotalTokenCount = await tokenCountByDoctor(user.user_id);
    const nextPatients = await tokenByDoctor(user.user_id);

    const currentToken = 45;
    const estimateWaitTime = 12;

    return res.json({ todayTotalTokenCount, currentToken, estimateWaitTime, nextPatients });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
