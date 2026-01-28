const abhaLogin = require('./lib/abha.login');
const abhaOtpVerify = require('./lib/abha.otp.verify');
const tokenGen = require('./lib/token.gen');

module.exports = async (req, res) => {
  try {
    const { mobile, otp, txn_id } = req.body;

    const token = await tokenGen();
    const otpVerify = await abhaOtpVerify(token, mobile, otp, txn_id);

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
        const abhaProfile = await abhaLogin(token, abhaId, txn_id);
        return res.status(200).json(abhaProfile);
      } else {
        // suggest abha address
        // create API
      }
    }

    return res.status(200).json(otpVerify);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
