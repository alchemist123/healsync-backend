const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadProcess = require('./upload.process');

// Multer configuration for temporary file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, '/tmp/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });


router.post('/upload', upload.single('file'), uploadProcess.handleUpload);

module.exports = router;
