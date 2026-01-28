const axios = require('axios');

module.exports = async (token, mobile, otp, txn_id) => {
  try {
    const response = await axios.post(
      'https://api.eka.care/abdm/na/v1/registration/aadhaar/verify',
      {
        mobile,
        otp,
        txn_id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
