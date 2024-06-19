const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { createAndSendtoken } = require('./../controllers/authController');

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    createAndSendtoken(doc, 201, res);
  });
};

exports.getOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

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
