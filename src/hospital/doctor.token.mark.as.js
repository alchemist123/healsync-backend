const tokenUpdate = require('../patiant/lib/token.update');

module.exports = async (req, res) => {
  try {
    const { user } = req;
    const { token_number } = req.body;

    const response = await tokenUpdate(token_number, user.user_id, 'completed');
    return res.json(response);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
