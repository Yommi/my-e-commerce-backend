const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Product = require('./../models/productModel');
const factory = require('./../controllers/factoryController');

exports.createProduct = factory.createOne(Product);

exports.setVendorId = (req, res, next) => {
  req.body.vendor = req.user.id;

  next();
};
