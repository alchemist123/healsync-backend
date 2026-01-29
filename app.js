require('module-alias/register');
var createError = require('http-errors');
var express = require('express');
const dotenv = require('dotenv');
const logger = require('@middlewares/logger.middleware');
var app = express();
var cors = require('cors');
dotenv.config();
const abhaRouter = require('./src/abha/router');
const chatRouter = require('./src/chat/router');
const pataiantRouter = require('./src/patiant/router');
const hospitalRouter = require('./src/hospital/routes');
app.use(logger);
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-Access-Token'],
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
// Ensure preflight OPTIONS gets CORS headers (fixes CORS on /patient/dashboard and other auth routes)
app.options('*', cors(corsOptions));
const medicalDocsRouter = require('./src/medical-docs/router');
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
app.use('/patient', pataiantRouter);
app.use('/hospital', hospitalRouter);
app.use('/medical-docs', medicalDocsRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler: ensure CORS headers on all error responses (401, 404, 500)
app.use(function (err, req, res, next) {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
});

module.exports = app;
