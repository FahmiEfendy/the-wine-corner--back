const fs = require("fs");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); // Parse any incoming body to extract JSON data

const HttpError = require("./models/http-error");

const authRoutes = require("./routes/auth-routes");
const productRoutes = require("./routes/product-routes");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  // Specify what IP Address allowed to access resource
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Specify what headers allowed to use
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  // Specify what methods allowed to use
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use("/api/auth", authRoutes);
app.use("/api", productRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find any matches routes!", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) fs.unlink(req.file.path, (err) => console.log(err));

  if (res.headerSent) return next(error);

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster-place.arkm4vk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Successfully connected to database!");
    app.listen(process.env.PORT || 5000);
  })
  .catch((error) => console.log("Failed to connect to database!", error));
