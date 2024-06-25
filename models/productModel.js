const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
  },
  description: String,
  price: {
    type: Number,
    required: [true, 'A product must have a price'],
  },
  category: {
    type: String,
    enum: ['edible', 'non-edible'],
    required: [true, 'A product must can either be edible or non-edible'],
  },
  quantity: {
    type: Number,
  },
  vendor: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
  },
});

const Product = new mongoose.model('Product', productSchema);

module.exports = Product;
