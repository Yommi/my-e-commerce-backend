const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router.use(authController.protect);
// ALL ROUTES AFTER THE ABOVE WILL BE PROTECTED

router.route('/getMe').get(userController.getOrDeleteMe, userController.getUser);
router.route('/updateMe').patch(userController.updateMe, userController.updateUser);
router
  .route('/deleteMe')
  .delete(userController.getOrDeleteMe, userController.deleteUser);

router.route('/updatePassword').patch(authController.updatePassword);

router.use(authController.restrictTo('admin'));
// ALL ROUTES AFTER THE ABOVE WILL ONLY BE ACCESSABLE BY ADMINS

router.route('/').post(userController.createUser).get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
