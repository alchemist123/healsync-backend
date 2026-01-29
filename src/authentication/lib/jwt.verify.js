const jwt = require('jsonwebtoken');

module.exports = (token) => {
  try {
    const decoded = jwt.verify(token, 'binarybits2026');
    return JSON.parse(decoded.data);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
