const express = require("express");
const router = express.Router();

const viewController = require("./../controllers/viewController");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userControllers");
const bookingController = require("../controllers/bookingController");

// Protected Middleware
router.use(authController.isLoggedIn);

// Protected Routes
router.route("/").get(viewController.OverviewPage);
router.route("/me").get(authController.protect, userController.getMe);
router
  .route("/my-bookings")
  .get(
    authController.protect,
    bookingController.createCheckout,
    userController.getMyBookings
  );
router.route("/tour/:slug").get(viewController.TourPage);
router.route("/login").get(viewController.getLoginForm);
router.route("/signup").get(viewController.getSignupForm);
router.route("/forgot-password").get(viewController.getForgotPasswordForm);
router.route("/reset-password/:token").get(viewController.getResetPasswordForm);
router.post("/submit-user-data", viewController.updateUserData);

module.exports = router;
