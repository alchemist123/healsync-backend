require('module-alias/register');
var createError = require('http-errors');
var express = require('express');
const dotenv = require('dotenv');
const logger = require('@middlewares/logger.middleware');
dotenv.config();
var app = express();
var cors = require('cors');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('trust proxy', true);
app.use((req, res, next) => {
  let ip =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress 
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0];
  }
  req.headers['x-origin-ip'] = ip;
  req.headers['x-browser'] = req.headers['user-agent'];
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'healsync-backend'
  });
});

app.use(function (req, res, next) {
    next(createError(404));
  });
  
  module.exports = app;