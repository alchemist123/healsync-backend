const abhaOtpGen = require('../abha/lib/abha.otp.gen');
const tokenGen = require('../abha/lib/token.gen');
const userCreate = require('../user/lib/user.create');
const userFind = require('../user/lib/user.find');

module.exports = async (req, res) => {
  try {
    const { aadhaar_number, mobile } = req.body;

    const ekaToken = await tokenGen();
    const abhaOtp = await abhaOtpGen(ekaToken, aadhaar_number);
    const user = await userFind(mobile);
    if (user === null) {
      await userCreate({ phone: mobile, aadhaar_number, user_type: 'patient' });
    }

    return res.status(200).json({ mobile, txn_id: abhaOtp.txn_id });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
