const hospital = {}
hospital.create = require('./create.hospital');
hospital.addDoctor = require('./add.doctor');
hospital.mapDept = require('./map.dept');
hospital.doctorList = require('./doctor.list');
module.exports = hospital;