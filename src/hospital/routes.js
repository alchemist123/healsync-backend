const register = require('./register');
const Router = require('express').Router;
const hospitalRouter = Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

hospitalRouter.post('/register', asyncHandler(register));

module.exports = hospitalRouter;