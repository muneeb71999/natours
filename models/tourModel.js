const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "A tour must have a name"],
      maxlength: [40, "Tour name must have less or equal to 40 characters"],
      minlength: [10, "Tour must have greater or eqaul to 10 characters"],
      // validate: [validator.isAlpha, "Tour name must only contains Alphabats"]
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A group size is required"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty could be easy, medium or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1"],
      max: [5, "Rating must be below 5"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A Tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // Only runs for the new doc not for updating the price
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below then actual price",
      },
    },
    discount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: true,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        description: String,
        day: String,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

// Virtual Properties
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

// DOCUMENT MIDDLEWARE

// tourSchema.post("save", function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
  });
  next();
});

tourSchema.pre("save", function (next) {
  this.slug = this.name.split(" ").join("-").toLowerCase();
  next();
});

// tourSchema.pre(/^find/, async function (next) {
//   const guidesPromise = this.guides.map(
//     async (id) => await User.findById(id).select("-_v -passwordChangedAt")
//   );
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });

// tourSchema.pre("find", function(next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

// tourSchema.pre(/^find/, function(next) {
//   this.find({ secretTour: { $ne: true } });
//   this.startsAt = Date.now();
//   next();
// });

// tourSchema.post(/^find/, function(doc, next) {
//   console.log(doc);
//   console.log("Time Taken = ", Date.now() - this.startsAt, " milliseconds.");
//   next();
// });

// AGGREGATION MIDDLEWARE
// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({
//     $match: {
//       secretTour: { $ne: true },
//     },
//   });
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
