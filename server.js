const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); // Parse any incoming body to extract JSON data

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

const productRoutes = require("./routes/product-routes");

app.use("/api/product", productRoutes);

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster-place.arkm4vk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Successfully connected to database!");
    app.listen(process.env.PORT || 5000);
  })
  .catch((error) => console.log("Failed to connect to database!", error));
