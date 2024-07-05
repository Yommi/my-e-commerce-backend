const express = require('express');
const authController = require('./../controllers/authController');
const productController = require('./../controllers/productController');
const cartRoutes = require('./cartRoutes');

const router = express.Router();

router.use('/:productId/addToCart', cartRoutes);
// THE ABOVE IS A NESTED ROUTE

router.use(authController.protect);
// ALL ROUTES AFTER THE ABOVE WILL BE PROTECTED

router
  .route('/')
  .post(
    authController.restrictTo('vendor'),
    productController.setVendorId,
    productController.createProduct
  )
  .get(authController.restrictTo('admin'), productController.getAllProducts);

router
  .route('/myProducts')
  .get(authController.restrictTo('vendor'), productController.myProducts)
  .patch(
    authController.restrictTo('vendor'),
    productController.myProducts,
    productController.updateProduct
  )
  .delete(
    authController.restrictTo('vendor'),
    productController.myProducts,
    productController.deleteProduct
  );

router.use(authController.restrictTo('admin'));
// ALL ROUTES AFTER THE ABOVE WILL ONLY BE ACCESSABLE BY ADMINS

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
