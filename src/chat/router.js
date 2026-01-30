const Router = require('express').Router;
const processMessage = require('./message.process');
const getActiveThread = require('./activeThread.process');
const multer = require('multer');
const authentication = require('../../middlewares/authentication');
const chatRouter = Router();

// Multer configuration for temporary file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, '/tmp/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

chatRouter.post('/message', upload.any(), authentication, processMessage);
chatRouter.get('/active-thread', authentication, getActiveThread);

module.exports = chatRouter;
