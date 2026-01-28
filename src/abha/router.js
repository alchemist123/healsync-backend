const Router = require('express').Router;
const genToken = require('../abha/token.gen');
const sendAbhaOtp = require('./abha.otp.send');
const abhaOtpVerify = require('./abha.otp.verify');
const abhaRouter = Router();

abhaRouter.get('/generate-token', genToken);
abhaRouter.post('/otp-send', sendAbhaOtp);
abhaRouter.post('/otp-verify', abhaOtpVerify);

module.exports = abhaRouter;
