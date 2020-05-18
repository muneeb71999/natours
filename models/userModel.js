const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [5, "name needs to be minimum 5 character longer"],
    maxlenght: [50, "name should be smaller or equal to 50 characters"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "password is required"],
    trim: true,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "confirm password is required"],
    trim: true,
    validate: {
      // Only works on save() and create()
      validator: function (val) {
        return val === this.password;
      },
      message: "Password does not match",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  try {
    // Runs only if the password is modified
    if (!this.isModified("password")) return next();

    // Hash the password with the cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete the passwordConfirm
    this.passwordConfirm = undefined;
  } catch (err) {
    console.log(err);
  }
  // call the next middleware
  next();
});

userSchema.pre("save", function () {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({
    active: {
      $ne: false,
    },
  });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const tokenTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);
    console.log(this.passwordChangedAt, JWTTimeStamp);
    return JWTTimeStamp < tokenTimestamp;
  }

  // False If the password has not been changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
