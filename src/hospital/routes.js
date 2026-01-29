const register = require('./register');
const Router = require('express').Router;
const createDoctor = require('./create.doctor');
const hospitalRouter = Router();

hospitalRouter.post('/register', register);
hospitalRouter.post('/doctor', createDoctor);

module.exports = hospitalRouter;