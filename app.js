const express = require('express');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const errorController = require('./controllers/errorController');

const app = express();

// MORGAN LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// BODY PARSER
app.use(express.json());

// ROUTE MOUNTING
app.use('/api/v1/users', userRoutes);

app.use(errorController);

module.exports = app;
