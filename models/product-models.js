const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productPrice: { type: String, required: true },
  productCategoryId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  productImage: { type: String, required: true },
});

module.exports = mongoose.model("Product", productSchema);
