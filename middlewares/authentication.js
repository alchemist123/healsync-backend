const jwtVerify = require('../src/authentication/lib/jwt.verify');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'];
    if (!token) {
      return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }
    const user = await jwtVerify(token);
    req.user = user;
    console.log("user", user)
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }
};
