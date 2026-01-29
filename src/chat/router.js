const Router = require('express').Router;
const processMessage = require('./message.process');
const getActiveThread = require('./activeThread.process');
const chatRouter = Router();

chatRouter.post('/message', processMessage);
chatRouter.get('/active-thread', getActiveThread);

module.exports = chatRouter;
