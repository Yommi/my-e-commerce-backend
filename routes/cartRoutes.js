const express = require('express');
const authController = require('./../controllers/authController');
const cartController = require('./../controllers/cartController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
// ALL ROUTES AFTER THE ABOVE ARE PROTECTED AND ONLY ACCESSABLE BY LOGGED IN USERS

router.route('/myCart').get(cartController.setCartId, cartController.getCart);

router
  .route('/myCart/:productId')
  .delete(cartController.setCartId, cartController.deleteProductFromCart)
  .patch(cartController.setCartId, cartController.reduceProductCount);

router
  .route('/')
  .post(cartController.AddToCart)
  .get(authController.restrictTo('admin'), cartController.getAllCarts);

router.use(authController.restrictTo('admin'));
router.route('/:id').get(cartController.getCart).delete(cartController.deleteCart);

router.route('/:id/:productId').delete(cartController.deleteProductFromCart);

module.exports = router;
