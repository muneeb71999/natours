const express = require("express");

const userController = require("./../controllers/userControllers");
const authController = require("./../controllers/authController");

const router = express.Router();

// USERS ROUTE
// Authentication Routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// Protect middleware for all the routes defined below
router.use(authController.protect);

// Protect Routes
router.patch("/updateMyPassword", authController.updatePassword);
router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.get("/deleteMe", userController.deleteMe);
router.get("/me", authController.protect, userController.getMe);

// Protected Routes for the admin
router.use(authController.restrictTo("admin"));
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
