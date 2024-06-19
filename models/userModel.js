const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'A user must have an email address'],
    validate: [validator.isEmail, 'invalid email address'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must confirm their password'],
    validate: {
      validator: function (pass) {
        return pass === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// ENCRYPTS PASSWORD ON CREATION OR MODIFICATION
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

const User = new mongoose.model('User', userSchema);

module.exports = User;
