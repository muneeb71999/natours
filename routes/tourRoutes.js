const express = require("express");
const router = express.Router();

const tourController = require("./../controllers/tourController");
const authController = require("./../controllers/authController");
const reviewRouter = require("./reviewRoutes");

// This middleware will only run for the endpoints that
// has a id parameter in it and call the checkId function

// router.param('id', tourController.checkId);

router.use("/:tourId/reviews", reviewRouter);

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route("/tour-stat")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.getTourStat
  );
router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "guide", "lead-guide"),
    tourController.getMonthlyPlane
  );

router
  .route("/tour-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getWithIn);
// tour-within/:distance/center/:latlng/unit/:unit

router.route("/distances/:latlng/unit/:unit").get(tourController.getDistancese);

router.route("/").get(tourController.getAllTours).post(
  authController.protect,
  authController.restrictTo("admin", "lead-guide"),

  tourController.createTour
);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTourImagesData,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = router;
