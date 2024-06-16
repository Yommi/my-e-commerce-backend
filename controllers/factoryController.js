const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')

exports.createOne = (Model) => {
    return catchAsync (async (req, res, next) => {
        const doc = await Model.create( req.body )

        res.status(200).json({
            status: 'success',
            data: {
                doc
            }
        })
    }
)}

exports.getOne = (Model) => {
    return catchAsync (async (req, res, next) => {
        const doc = await Model.findById( req.params.id )

        res.status(200).json({
            status: 'success',
            data: {
                doc
            }
        })
    })
}

exports.getAll = (Model) => {
    return catchAsync (async (req, res, next) => {
        const docs = await Model.find()

        res.status(200).json({
            status: 'success',
            results: docs.length,
            data: {
                docs
            }
        })
    })
}

exports.updateOne = (Model) => {
    return catchAsync (async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate( req.params.id, req.body )

        res.status(200).json({
            status: 'success',
            data: {
                doc
            }
        })
    })
}