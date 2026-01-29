const Router = require('express').Router;
const otpSend = require('./otp.send');
const otpVerify = require('./otp.verify');
const pataiantRouter = Router();

pataiantRouter.post('/otp/send', otpSend);
pataiantRouter.post('/otp/verify', otpVerify);

module.exports = pataiantRouter;
