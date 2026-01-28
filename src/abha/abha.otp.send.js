const abhaOtpGen = require('./lib/abha.otp.gen');
const tokenGen = require('./lib/token.gen');

module.exports = async (req, res) => {
  try {
    const { aadhaar_number } = req.body;

    const token = await tokenGen();
    const otpGen = await abhaOtpGen(token, aadhaar_number);

    return res.status(200).json(otpGen);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
