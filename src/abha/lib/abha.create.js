const axios = require('axios');

module.exports = async (token, abha_address, txn_id) => {
  try {
    const response = await axios.post(
      'https://api.eka.care/abdm/na/v1/registration/aadhaar/create-phr',
      {
        abha_address,
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
