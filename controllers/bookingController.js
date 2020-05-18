const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Tour = require("./../models/tourModel");
const AppError = require("./../utils/AppError");
const catchAsync = require("./../utils/catchAsync");
const Booking = require("./../models/bookingModel");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get the tour from Database
  const tour = await Tour.findById(req.params.tourId);

  // Create a stripe session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get(
      "host"
    )}/my-bookings/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/tour-8-3.jpg`],
        amount: tour.price * 150 * 100,
        currency: "pkr",
        quantity: 1,
      },
    ],
  });

  // Send the response
  res.status(200).json({
    status: "success",
    session,
  });
});

exports.createCheckout = catchAsync(async (req, res, next) => {
  if (!req.query.session_id) return next();

  stripe.checkout.sessions.retrieve(req.query.session_id, async function (
    err,
    session
  ) {
    if (err) return next();

    if (session.payment_intent) {
      try {
        await Booking.create({
          checkout_id: req.query.session_id,
          tour: session.client_reference_id,
          user: req.user.id,
          price: session.display_items[0].amount / 15000,
        });
      } catch (err) {
        return next(new AppError("Error Proccessing your payemnt", 500));
      }
    }
  });

  res.redirect("/my-bookings");

  return next();
});
