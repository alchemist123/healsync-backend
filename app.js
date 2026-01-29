require('module-alias/register');
var createError = require('http-errors');
var express = require('express');
const dotenv = require('dotenv');
const logger = require('@middlewares/logger.middleware');
dotenv.config();
var app = express();
var cors = require('cors');
const abhaRouter = require('./src/abha/router');
const chatRouter = require('./src/chat/router');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('trust proxy', true);
app.use((req, res, next) => {
  let ip =
    req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
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
    service: 'healsync-backend',
  });
});

app.get('/', (req, res) => {
  res.send('Welcome to HealSync Backend API. Use /health to check status.');
});

app.use('/abha', abhaRouter);
app.use('/chat', chatRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

module.exports = app;
