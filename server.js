const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use("/", (req, res, next) => {
  res.send("Hello World!");
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
