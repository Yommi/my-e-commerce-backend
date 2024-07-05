const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
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
    role: {
      type: String,
      default: 'customer',
      enum: ['customer', 'vendor', 'admin'],
    },
    brandName: {
      type: String,
      required: [
        function () {
          return this.role === 'vendor';
        },
        'A vendor must have a brand name',
      ],
      unique: true,
    },
    cart: {
      type: mongoose.Schema.ObjectId,
      ref: 'Cart',
      required: [
        function () {
          return this.role === 'customer';
        },
        'A vendor must have a brand name',
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'vendor',
});

// ENCRYPTS PASSWORD ON CREATION OR MODIFICATION
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.verifyPassword = async function (
  unencryptedPassword,
  encryptedpassword
) {
  return await bcrypt.compare(unencryptedPassword, encryptedpassword);
};

userSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangeTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return passwordChangeTime > jwtTimeStamp;
  }
};

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = new mongoose.model('User', userSchema);

module.exports = User;
