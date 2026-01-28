const tokenGen = require('./lib/token.gen');

module.exports = async (req, res) => {
  try {
    const token = await tokenGen();
    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
