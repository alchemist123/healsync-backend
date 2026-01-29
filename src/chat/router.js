const Router = require('express').Router;
const processMessage = require('./message.process');
const getActiveThread = require('./activeThread.process');
const multer = require('multer');
const chatRouter = Router();

// Multer configuration for temporary file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, '/tmp/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

chatRouter.post('/message', upload.any(), processMessage);
chatRouter.get('/active-thread', getActiveThread);

module.exports = chatRouter;
