const Review = require("./../models/reviewModel");
const factory = require("./handleFactory");
const catchAsync = require("../utils/catchAsync");
// const AppError = require("../utils/AppError");

module.exports.setTourUserIds = catchAsync(async (req, res, next) => {
  // Allow Nested Routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
});

module.exports.getAllReviews = factory.getAll(Review);
module.exports.createReview = factory.createOne(Review);
module.exports.updateReview = factory.updateOne(Review);
module.exports.deleteReview = factory.deleteOne(Review);
module.exports.getReview = factory.getOne(Review);
