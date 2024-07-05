const factory = require('./factoryController');
const Cart = require('./../models/cartModel');
const User = require('./../models/userModel');
const Product = require('./../models/productModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.setCartId = (req, res, next) => {
  req.params.id = req.user.cart;

  next();
};

exports.AddToCart = catchAsync(async (req, res, next) => {
  let cart;

  if (!req.body.items) {
    req.body.items = [];
  }

  req.body.items.push({ product: req.params.productId });

  cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    req.body.user = req.user.id;
    cart = await Cart.create(req.body);
  } else {
    if (cart.items.length < 1) {
      cart.items.push({ product: req.params.productId });
    } else {
      cart.items.forEach((obj) => {
        if (obj.product.toString() === req.params.productId) {
          obj.productCount++;
        } else {
          cart.items.push({ product: req.params.productId });
        }
      });
    }
    cart.save({ validateBeforeSave: true });
  }

  const user = await User.findById(req.user.id);
  user.cart = cart.id;
  user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: cart,
  });
});

exports.getAllCarts = factory.getAll(Cart);

exports.getCart = factory.getOne(Cart, {
  path: 'items.product',
  select: 'name price images vendor',
});

exports.deleteCart = factory.deleteOne(Cart);

exports.deleteProductFromCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findById(req.params.id);

  if (cart.items.length < 1) {
    return next(new AppError('There are no items in users cart', 404));
  }

  cart.items.forEach(async (obj) => {
    if (!(obj.product._id.toString() === req.params.productId)) {
      return next(new AppError('This product is not in the users cart', 404));
    } else {
      cart.items = cart.items.filter(
        (obj) => obj.product._id.toString() !== req.params.productId
      );

      await cart.save();

      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  });
});

exports.reduceProductCount = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne(req.params.id);

  cart.items.forEach((obj) => {
    if (obj.product.toString() === req.params.productId) {
      obj.productCount--;
    }
  });
  cart.save({ validateBeforeSave: true });

  res.status(200).json({
    status: 'success',
    data: cart,
  });
});
