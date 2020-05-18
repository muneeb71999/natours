const moongose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new moongose.Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, "You must have an review."],
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    tour: {
      type: moongose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "A review must belong to a tour"],
    },
    user: {
      type: moongose.Schema.ObjectId,
      ref: "User",
      required: [true, "A Review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: "tour",
  //   select: "name _id -guides",
  // }).populate({
  //   path: "user",
  //   select: "name",
  // });
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats.avgRating,
      ratingsQuantity: stats.nRating,
    });
  }
};

reviewSchema.post("save", function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
});

const Review = moongose.model("Review", reviewSchema);
module.exports = Review;
