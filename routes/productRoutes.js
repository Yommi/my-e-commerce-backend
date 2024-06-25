const express = require('express');
const authController = require('./../controllers/authController');
const productController = require('./../controllers/productController');

const router = express.Router();

router.use(authController.protect);
// ALL ROUTES AFTER THE ABOVE WILL BE PROTECTED

router
  .route('/')
  .post(
    authController.restrictTo('vendor'),
    productController.setVendorId,
    productController.createProduct
  );

module.exports = router;
