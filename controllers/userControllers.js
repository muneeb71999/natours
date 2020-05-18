const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/userModel");
const Booking = require("./../models/bookingModel");
const Tour = require("./../models/tourModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handleFactory");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename(req, file, cb) {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    const err = new AppError("Not an image please upload only images", 400);
    cb(err, false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// {
//   fieldname: 'photo',
//   originalname: 'user-5c8a1d5b0190b214360dc057-1589529044441.jpeg',
//   encoding: '7bit',
//   mimetype: 'image/jpeg',
//   buffer: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 48 00 48 00 00 ff e1 04 3a 45 78 69 66 00 00 4d 4d 00 2a 00 00 00 08 00 0b 01 06 00 03 00 00 00 01 00 02 ... 21942 more bytes>,
//   size: 21992
// }

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(350, 350)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.uploadUserPhoto = upload.single("photo");

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create an error if user try to upate the error
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password update please use /updateMyPassword endpoint",
        401
      )
    );
  }

  // Filtered out the unwanted fields
  const filteredObj = filterObj(req.body, "name", "email");
  if (req.file) {
    filteredObj.photo = req.file.filename;
  }

  // Update the data for the user
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredObj, {
    new: true,
    runValidators: true,
  });

  // Send back the data with json
  // res.locals.user = updatedUser;
  res.status(200).json({
    status: "success",
    message: "Data Updated Successfully ....",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // Get the currenUser Id
  const userId = req.user._id;

  // Change the active field to false
  await User.findByIdAndUpdate(userId, {
    active: false,
  });

  // Send the response to the user
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "Internal Error",
    message: "This route is not yet defined, Please use /signup instead",
  });
};

exports.getMe = catchAsync(async (req, res, next) => {
  const isAdmin = req.user.role === "admin" ? true : false;
  // console.log(req.user);
  res.status(200).render("me", { isAdmin, title: "Your Account" });
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  // Get the bookings of a user from database
  const bookings = await Booking.find({ user: req.user.id });

  const tourIds = bookings.map((el) => el.tour);
  // console.log(tourIds);
  let tours = [];
  const pendingPromise = tourIds.map(async (el) => {
    return await Tour.findById(el.id);
  });

  tours = await Promise.all(pendingPromise);

  // await Tour.find({ _id:  });

  console.log(tours);
  // render the page
  res.status(200).render("overview", { title: "My Bookings", tours });
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// Do not use it for change password
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
