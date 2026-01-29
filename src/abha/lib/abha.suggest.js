const axios = require('axios');

module.exports = async (token) => {
  try {
    const response = await axios.get('https://api.eka.care/abdm/na/v1/registration/suggest', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
