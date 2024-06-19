const factory = require('./factoryController');
const User = require('./../models/userModel');

exports.createUser = factory.createOne(User);

exports.getUser = factory.getOne(User);

exports.getAllUsers = factory.getAll(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
