const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const sendEmail = require('./../utils/sendEmail');

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

exports.signupAdmin = catchAsync(async (req, res, next) => {
  req.body.role = 'admin';

  const doc = await User.create(req.body);

  createAndSendtoken(doc, 201, res);
});

exports.signupCustomer = catchAsync(async (req, res, next) => {
  if (req.body.role === 'admin') {
    return next(new AppError('You cannot set user role!', 401));
  }

  req.body.role = 'customer';

  const doc = await User.create(req.body);

  createAndSendtoken(doc, 201, res);
});

exports.signupVendor = catchAsync(async (req, res, next) => {
  if (req.body.role === 'admin') {
    return next(new AppError('You cannot set user role!', 401));
  }

  req.body.role = 'vendor';

  const doc = await User.create(req.body);

  createAndSendtoken(doc, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide both email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  createAndSendtoken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not permitted to access this route', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user attched to this token no longer exists!', 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again', 401)
    );
  }

  req.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You are not permitted to access this route', 403));
    }
    next();
  };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!user.verifyPassword(req.body.oldPassword, user.password)) {
    return next(new AppError('Old password is incorrect', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save({ validateBeforeSave: true });

  createAndSendtoken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 400));
  }

  const resetToken = user.createResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot password? Submit a PATCH request with your new password and passWordConfirm to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: `Your reset token will expire in 10 minutes`,
      message,
    });

    res.status(200).json({
      status: 'success',
      message: `Password reset token sent to email`,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save();

    return next(
      new AppError(`There was an error sending the email! Try again later`, 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordChangedAt = Date.now();
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save({ validateBeforeSave: true });

  createAndSendtoken(user, 200, res);
});
