const jwtGen = require('../authentication/lib/jwt.gen');
const userFind = require('../user/lib/user.find');
const doctorFind = require('./lib/doctor.find');
const healthcareInstitution = require('./lib/hospital.find');

module.exports = async (req, res) => {
  try {
    const { otp, phone } = req.body;

    if (otp !== '777777') throw new Error('Invalid OTP');

    const user = await userFind(phone);
    if (!user) throw new Error('User not found');

    if (user.user_type === 'doctor') {
      const doctor = await doctorFind(user.id);
      if (!doctor) {
        throw new Error('Doctor profile not found for this user');
      }
      const token = jwtGen({ user_id: user.id, doctor_id: doctor.id, type: user.user_type });

      return res.status(200).json({
        message: `${user.user_type} signed in successfully`,
        data: token,
      });
    }

    if (user.user_type === 'admin') {
      const hospital = await healthcareInstitution(user.id);
      if (!hospital) {
        throw new Error('Health Care Institution not found for this user');
      }
      const token = jwtGen({ user_id: user.id, institution_id: hospital.id, type: user.user_type });

      return res.status(200).json({
        message: `${user.user_type} signed in successfully`,
        data: token,
      });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
