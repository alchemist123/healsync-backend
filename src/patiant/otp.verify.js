const abhaCreate = require('../abha/lib/abha.create');
const abhaSuggest = require('../abha/lib/abha.suggest');
const tokenGen = require('../abha/lib/token.gen');
const abhaLogin = require('../abha/lib/abha.login');
const abhaOtpVerify = require('../abha/lib/abha.otp.verify');
const userFind = require('../user/lib/user.find');
const patientCreate = require('./lib/patient.create');
const patientFind = require('./lib/patient.find');
const jwtGen = require('../authentication/lib/jwt.gen');

module.exports = async (req, res) => {
  try {
    const { txn_id, mobile, otp } = req.body;

    const ekaToken = await tokenGen();
    const otpVerify = await abhaOtpVerify(ekaToken, mobile, otp, txn_id);
    let abhaProfile = null;

    if (otpVerify && otpVerify.skip_state == 'confirm_mobile_otp') {
      return res.status(200).json({
        message:
          'System identified a different mobile number is linked with adhaar, please enter the otp sent to the enterd mobile number to proceed further.',
        skip_state: otpVerify.skip_state,
        txn_id: otpVerify.txn_id,
      });
    }

    if (otpVerify && otpVerify.skip_state == 'abha_create') {
      if (otpVerify.abha_profiles.lenght > 0) {
        const abhaId = otpVerify.abha_profiles[0].abha_address;
        abhaProfile = await abhaLogin(token, abhaId, txn_id);
      } else {
        const abhaId = await abhaSuggest(ekaToken);
        abhaProfile = await abhaCreate(ekaToken, abhaId[0], txn_id);
      }
    }

    if (abhaProfile) abhaProfile = abhaProfile.profile;
    if (!abhaProfile && otpVerify?.profile) abhaProfile = otpVerify.profile;

    const user = await userFind(mobile);
    if (user) {
      const patient = await patientFind(user.id);
      if (!patient) {
        await patientCreate({ ...abhaProfile, user_id: user.id });
      }
    }

    const accessToken = jwtGen({ ...abhaProfile, user_id: user.id });
    return res
      .status(200)
      .json({ message: 'User signed in successfully', access_token: accessToken });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
