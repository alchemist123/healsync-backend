const axios = require('axios');

module.exports = async () => {
  try {
    const response = await axios.post(
      'https://api.eka.care/connect-auth/v1/account/login',
      {
        client_id: process.env.EKA_CLIENT_ID,
        client_secret: process.env.EKA_CLIENT_SECRET,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
