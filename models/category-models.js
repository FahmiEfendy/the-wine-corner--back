const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  productPath: { type: String, required: true },
  productType: { type: String, required: true },
  products: [{ type: mongoose.Types.ObjectId, required: true, ref: "Product" }],
});

module.exports = mongoose.model("Category", categorySchema);
