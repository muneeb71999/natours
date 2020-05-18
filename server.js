const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught Exception, shutting down......");
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// const DB =
//   "mongodb+srv://muneeb:<qljIb6hXu8HHLXyK>@cluster0-qc7fx.mongodb.net/test?retryWrites=true&w=majority";

const DBLOCAL = process.env.DATABASE_LOCAL;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conntected to DB ...."))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 3000;
const server = app.listen(
  PORT,
  console.log(`server is running on ${PORT}.....`)
);

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled Rejection, Shutting down .....");
  server.close(() => {
    process.exit(1);
  });
});
