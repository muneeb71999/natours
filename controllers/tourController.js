const multer = require("multer");
const sharp = require("sharp");
const Tour = require("../models/tourModel");
const factory = require("./handleFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/tours");
//   },
//   filename: (req, file, cb) => {
//     const ext = req.file.mimetype.split('/')[1];
//     cb(null, `tour-${req.tour.id}-${Date.now()}.${ext}`)
//   },
// });

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    const err = new AppError("Not an image, Please upload image files", 400);
    cb(err, false);
  }
};

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (req.files.imageCover && req.files.imageCover[0]) {
    const filename = `tour-${req.params.id}-${Date.now()}.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(1000, 1000)
      .toFormat("jpeg")
      .jpeg({ quality: 85 })
      .toFile(`public/img/tours/${filename}`);
    req.files.imageCover[0].filename = filename;
  }

  // req.files.images.forEach((image, index) => {
  //   const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
  //   sharp(image.buffer)
  //     .resize(1000, 1000)
  //     .toFormat("jpeg")
  //     .jpeg({ quality: 90 })
  //     .toFile(`public/img/tours/${filename}`);
  //   req.files.images[index].filename = filename;
  // });

  await Promise.all(
    req.files.images.map(async (image, index) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
      await sharp(image.buffer)
        .resize(1000, 1000)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.files.images[index].filename = filename;
    })
  );

  next();
});

exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.updateTourImagesData = (req, res, next) => {
  if (req.files.imageCover && req.files.imageCover[0]) {
    req.body.imageCover = req.files.imageCover[0].filename;
  }

  if (req.files.images) {
    req.body.images = req.files.images.map((image) => image.filename);
  }
  next();
};

// ROUTE HANDLER FUNCTION
exports.aliasTopTours = catchAsync(async (req, res, next) => {
  req.query.sort = "-ratingsAverage,price";
  req.query.limit = "5";
  req.query.fields = "name,price,difficulty,ratingsAverage,summary";
  next();
});

exports.getTourStat = catchAsync(async (req, res, next) => {
  const stat = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: {
          $gte: 4.5,
        },
      },
    },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: {
        _id: -1,
      },
    },
    {
      $match: {
        _id: { $ne: 4.5 },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stat,
    },
  });
});

exports.getMonthlyPlane = catchAsync(async (req, res, next) => {
  const year = req.params.year;
  const report = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTours: { $sum: 1 },
        tour: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTours: -1,
      },
    },
  ]);

  res.status(200).json({
    status: "sucess",
    data: {
      report,
    },
  });
});

// tour-within/:distance/center/:latlng/unit/:unit
// tour-within/:distance/center/31.4831569,74.1943053/unit/:unit
exports.getWithIn = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and langitude in format of lat, lng",
        400
      )
    );
  }

  // console.log(distance, lat, lng, unit);
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistancese = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  let multipler;
  if (unit) {
    multipler = unit === "mi" ? 0.000621371 : 0.001;
  }

  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and langitude in format of lat, lng",
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multipler,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data: distances,
    },
  });
});

exports.getTour = factory.getOne(Tour, { path: "reviews" });
exports.getAllTours = factory.getAll(Tour);
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
