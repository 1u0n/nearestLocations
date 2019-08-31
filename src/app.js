const express = require('express');
const logger = require('morgan');

const locationsRouter = require('./locationsRouter');

const app = express();
app.disable('x-powered-by');

app.use(logger('dev'));
app.use(express.json());

app.use('/locations', locationsRouter);

module.exports = app;
