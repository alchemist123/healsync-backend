const Router = require('express').Router;
const processMessage = require('./message.process');
const chatRouter = Router();

chatRouter.post('/message', processMessage);

module.exports = chatRouter;
