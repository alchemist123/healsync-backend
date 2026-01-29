const register = require('./register');
const Router = require('express').Router;
const createDoctor = require('./create.doctor');
const listDepartments = require('./list.departments');
const listDoctors = require('./list.doctors');
const hospitalRouter = Router();

hospitalRouter.post('/register', register);
hospitalRouter.post('/doctor', createDoctor);
hospitalRouter.get('/departments', listDepartments);
hospitalRouter.get('/doctors', listDoctors);

module.exports = hospitalRouter;