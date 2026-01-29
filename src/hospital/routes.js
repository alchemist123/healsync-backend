const register = require('./register');
const Router = require('express').Router;
const createDoctor = require('./create.doctor');
const listDepartments = require('./list.departments');
const listDoctors = require('./list.doctors');
const otpSend = require('./otp.send');
const otpVerify = require('./otp.verify');
const createDutySchedule = require('./create.duty-schedule');
const saveSchedule = require('./save.schedule');
const getUpcomingSchedule = require('./get.upcoming-schedule');
const dashboard = require('./dashboard');
const listTodayShifts = require('./list.today-shifts');
const hospitalRouter = Router();

hospitalRouter.get('/dashboard', dashboard);
hospitalRouter.post('/register', register);
hospitalRouter.post('/doctor', createDoctor);
hospitalRouter.get('/departments', listDepartments);
hospitalRouter.get('/doctors', listDoctors);
hospitalRouter.post('/schedule/duty', createDutySchedule);
hospitalRouter.post('/schedule/save', saveSchedule);
hospitalRouter.get('/schedule/upcoming', getUpcomingSchedule);
hospitalRouter.get('/schedule/today', listTodayShifts);
hospitalRouter.post('/otp/send', otpSend);
hospitalRouter.post('/otp/verify', otpVerify);

module.exports = hospitalRouter;
