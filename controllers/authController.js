const crypto = require("crypto");
const util = require("util");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/AppError");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const Email = require("./../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN + 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    // cookieOptions.secure = true;
  }
  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    message: "Password updated Successfully",
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get("host")}/me`;
  await new Email(newUser, url).sendWelome();
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) If email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide the email and password", 400));
  }
  // console.log(email, password);
  // 2) Check if the password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // console.log(user);
  // console.log("Before Checking password");
  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  // console.log("After Checking password");

  // 3) If everything is OK then send a response
  return createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // 1) Check if the token exist
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in, please login to get access"),
      401
    );
  }

  // 2) Validate the token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  if (decoded.exp > Date.now()) {
    return next(new AppError("Token has expired please login again", 401));
  }

  // 3) If user still exist
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exist", 401)
    );
  }

  // 4) auth Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    next(new AppError("User has changed password please login again", 401));
  }

  // GRANT Access to protected Routes
  req.user = currentUser;
  // console.log(req.user);
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    try {
      // 1) Check if the token exist
      token = req.cookies.jwt;

      if (!token) {
        return next();
      }

      // 2) Validate the token
      const decoded = await util.promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      if (decoded.exp > Date.now()) {
        return next();
      }

      // 3) If user still exist
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }

      // 4) Auth Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // 5) Grant Access to protected Routes
      res.locals.user = currentUser;
      req.user = currentUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // console.log("Test");
  // Get the user from POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    next(new AppError("There is no user with this email", 404));
  }

  // Generate a random token
  const resetToken = user.createPasswordResetToken();
  user.save({ validateBeforeSave: false });

  // Send the token to user by email
  const requestURL = `${req.protocol}://${req.get(
    "host"
  )}/reset-password/${resetToken}`;

  // const message = `Forgot Password ? Click the link below to reset your password ${requestURL} .\n If you did't forgot your password then ignore this email`;

  // await sendEmail({
  //   email: user.email,
  //   subject: `Reset your password (valid only for 10min)`,
  //   message,
  // });

  await new Email(user, requestURL).sendPasswordReset();

  res.status(200).json({
    status: "success",
    message: `Reset Password email has been send to ${user.email}`,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Check if the user exist and has a valid token with valid experation date

  // Convert the token to hashed token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // find the user by token number
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });

  // Throw an error if user does not exist
  if (!user)
    next(new AppError("This token is no logner valid please try again", 500));

  // Upate passwordChangedAt property for the document
  // => Done in userModel;

  // Reset some properties
  user.passwordResetExpire = undefined;
  user.passwordResetToken = undefined;
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // token = signToken(user._id);
  await user.save();

  createSendToken(user, 201, res);
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get the user from the collection
  const user = await User.findById(req.user._id).select("+password");
  if (!user) return next(new AppError("No user exit for this Id"), 404);
  // console.log(user);
  // Check if the old password is correct
  if (!(await user.correctPassword(req.body.oldPassword, user.password))) {
    return next(
      new AppError("Old Password does not match with the orignal one", 401)
    );
  }

  // if old password is correct then update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // const token = signToken(user._id);
  await user.save();

  // Log user in and send the jwt
  return createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    exp: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
});
