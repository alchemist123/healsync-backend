const Router = require('express').Router;
const otpSend = require('./otp.send');
const pataiantRouter = Router();

pataiantRouter.get('/otp/send', otpSend);

module.exports = pataiantRouter;
