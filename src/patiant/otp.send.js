const abhaOtpGen = require('../abha/lib/abha.otp.gen');
const tokenGen = require('../abha/lib/token.gen');

module.exports = async (req, res) => {
  try {
    const { aadhaar_number, mobile } = req.body;

    const ekaToken = await tokenGen();
    const abhaOtp = await abhaOtpGen(ekaToken, aadhaar_number);

    return res.status(200).json({ mobile, txn_id: abhaOtp.txn_id });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
