const axios = require('axios');

module.exports = async (token, aadhaar_number) => {
  try {
    const response = await axios.post(
      'https://api.eka.care/abdm/na/v1/registration/aadhaar/init',
      {
        aadhaar_number,
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
