const express = require('express');

const router = express.Router()

router.route('/').post((req, res, next) => {
    next()
})

module.exports = router