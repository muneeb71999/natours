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

const DBLOCAL = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
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

process.on("SIGTERM", () => {
  console.log("====================================");
  console.log("Gracefully shutting down the server");
  console.log("====================================");
  server.close(() => {
    console.log("Process is terminating");
  });
});
