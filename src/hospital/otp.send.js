const userFind = require('../user/lib/user.find');

module.exports = async (req, res) => {
  try {
    const { aadhaar_number, phone } = req.body;

    const user = await userFind(phone);
    if (!user) throw new Error('User not found');

    return res.status(200).json({
      message: `OTP sent successfully to - ${user.phone}`,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
