const jwt = require('jsonwebtoken');

module.exports = (data) => {
  try {
    const { user_id } = data;
    if (!user_id) throw new Error('user_id is required to generate token');

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
