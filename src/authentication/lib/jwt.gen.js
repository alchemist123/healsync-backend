const jwt = require('jsonwebtoken');

module.exports = (data) => {
  try {
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        data: JSON.stringify(data),
      },
      'binarybits2026',
    );
    return token;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
