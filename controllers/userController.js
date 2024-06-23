const factory = require('./factoryController');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');

exports.createUser = factory.createOne(User);

exports.getUser = factory.getOne(User);

exports.getAllUsers = factory.getAll(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.getOrDeleteMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.updateMe = (req, res, next) => {
  req.params.id = req.user.id;

  if (req.body.passoword || req.body.passwordConfirm) {
    return next(
      new AppError(
        `This route cannot update passwords, use: api/v1/users/updatePassword instead`
      )
    );
  }

  const filteredBody = filterObj(req.body, 'email');

  req.body = filteredBody;

  next();
};
