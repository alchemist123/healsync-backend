const hospital = {}
hospital.create = require('./create.hospital');
hospital.addDoctor = require('./add.doctor');
hospital.mapDept = require('./map.dept');
module.exports = hospital;