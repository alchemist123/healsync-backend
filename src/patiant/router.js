const Router = require('express').Router;
const authentication = require('../../middlewares/authentication');
const dashboard = require('./dashboard');
const otpSend = require('./otp.send');
const otpVerify = require('./otp.verify');
const pataiantRouter = Router();

pataiantRouter.post('/otp/send', otpSend);
pataiantRouter.post('/otp/verify', otpVerify);
pataiantRouter.get('/dashboard', authentication, dashboard);

module.exports = pataiantRouter;
