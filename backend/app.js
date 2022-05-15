const express = require("express");
const bodyParser = require("body-parser");
const placesRouters = require("./routes/places-routes");
const usersRouters = require("./routes/users-routes");
const HttpError = require("./models/http-error");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(bodyParser.json());
app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization, Content-Type"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});
app.use("/api/places", placesRouters);

app.use("/api/users", usersRouters);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(`Delete the file image : ${err}`);
    });
  }
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknow error occurred!" });
});

mongoose
  .connect(
    "mongodb+srv://anvesh6767:sHPwuZMBIKXVsD35@cluster0.hcocp.mongodb.net/places?retryWrites=true&w=majority"
  )
  .then(() => app.listen(5000))
  .catch((err) => {
    console.log(err);
  });
