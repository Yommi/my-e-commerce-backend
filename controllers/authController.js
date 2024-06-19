const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');

const createAndSendtoken = (doc, statusCode, res) => {
  const id = doc.id;

  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  if (doc.password) doc.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    data: {
      token,
      doc,
    },
  });
};

exports.createAndSendtoken = createAndSendtoken;

exports.signup = catchAsync(async (req, res, next) => {
  if (req.body.role === 'admin') {
    return next(
      new AppError(
        'You are only allowed to set role to user ("role" : "user")!',
        401
      )
    );
  }

  const doc = await User.create(req.body);

  createAndSendtoken(doc, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError('Please provide both email and password!', 400)
    );
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  createAndSendtoken(user, 200, res);
});
