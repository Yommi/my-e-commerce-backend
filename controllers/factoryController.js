const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { createAndSendtoken } = require('./../controllers/authController');
const User = require('./../models/userModel');
const Cart = require('./../models/cartModel');

exports.filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    if (Model === User) {
      createAndSendtoken(doc, 201, res);
    } else {
      res.status(200).json({
        status: 'success',
        data: doc,
      });
    }
  });
};

exports.getOne = (Model, popOptions) => {
  return catchAsync(async (req, res, next) => {
    let doc = await Model.findById(req.params.id);

    if (Model === Cart) {
      doc.items.forEach((obj) => {
        if (obj.productCount < 1) {
          doc.items = doc.items.filter((item) => item.productId !== obj.productId);
        }
      });
      doc.save({ validateBeforeSave: false });
    }

    if (!doc) {
      return next(new AppError('There is no document with that id', 404));
    }

    if (popOptions) {
      doc = await doc.populate(popOptions);
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
};

exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    const docs = await Model.find();

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        docs,
      },
    });
  });
};

exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    if (Model === User) {
      if (req.body.password || req.body.passwordConfirm) {
        return next(
          new AppError(
            `This route cannot update passwords, use: api/v1/users/updatePassword instead`
          )
        );
      }
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('There is no document with that id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
};

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('There is no document with that id', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};
