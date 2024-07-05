const mongoose = require('mongoose');
const Product = require('./productModel');

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A cart must have a user'],
    },
    items: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
          unique: true,
        },
        productCount: {
          type: Number,
          default: 1,
        },
      },
    ],
    createdAt: Date,
  },
  {
    toJson: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Cart = new mongoose.model('Cart', cartSchema);

module.exports = Cart;
