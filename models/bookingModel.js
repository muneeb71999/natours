const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
  checkout_id: {
    type: String,
    unique: true,
    trim: true,
    required: [true, "Booking cannot be created without checkout"],
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    unique: false,
    required: [true, "Booking must belong to a tour"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Booking must belong to a user"],
  },
  price: {
    type: Number,
    required: [true, "Booking must have a price"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate("user").populate({
    path: "tour",
    select: "name",
  });
  next();
});

const bookingModel = mongoose.model("Bookings", bookingSchema);
module.exports = bookingModel;
