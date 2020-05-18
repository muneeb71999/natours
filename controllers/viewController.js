const catchAsync = require("./../utils/catchAsync");
const Tour = require("./../models/tourModel");
const User = require("./../models/userModel");

exports.OverviewPage = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render("overview", {
    tours,
  });
});

exports.TourPage = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({
    slug: req.params.slug,
  }).populate({
    path: "reviews",
    select: "rating review user",
  });

  res.status(200).render("tour", {
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  if (req.user) {
    return res.redirect("/");
  }

  res.status(200).render("login", {
    title: "Please Login to your account",
  });
});

exports.getSignupForm = (req, res, next) => {
  if (req.user) {
    return res.redirect("/");
  }

  res.status(200).render("signup", {
    title: "Signup",
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findOneAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.render("me", {
    title: "Your Account",
    user: updatedUser,
  });
});

exports.getForgotPasswordForm = (req, res, next) => {
  if (req.user) {
    return res.redirect("/");
  }

  res.status(200).render("forgotPassword", {
    title: "Forgot Password",
  });
};

exports.getResetPasswordForm = (req, res, next) => {
  if (req.user) {
    return res.redirect("/");
  }

  if (req.params.token) {
    res.status(200).render("resetPassword", {
      title: "Reset your password",
    });
  } else {
    return res.redirect("/");
  }
};
