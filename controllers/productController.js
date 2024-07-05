const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Product = require('./../models/productModel');
const factory = require('./../controllers/factoryController');

exports.createProduct = factory.createOne(Product);

exports.getAllProducts = factory.getAll(Product);

exports.getProduct = factory.getOne(Product);

exports.updateProduct = factory.updateOne(Product);

exports.deleteProduct = factory.deleteOne(Product);

exports.setVendorId = (req, res, next) => {
  req.body.vendor = req.user.id;

  next();
};

exports.myProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({ vendor: req.user.id });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: products,
  });
});
