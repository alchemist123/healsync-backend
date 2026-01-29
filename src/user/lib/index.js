const user = {}
user.create = require('./create');
user.findById = require('./user.find.id');
user.find = require('./find');
user.isExist = require('./is.exsist');
module.exports = user;