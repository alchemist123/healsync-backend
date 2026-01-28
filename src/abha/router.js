const Router = require('express').Router;
const genToken = require('../abha/token.gen');

const abhaRouter = Router();

abhaRouter.get('/generate-token', genToken);

module.exports = abhaRouter;
