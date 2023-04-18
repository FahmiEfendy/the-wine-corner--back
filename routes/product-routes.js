const express = require("express");

const router = express.Router();

const fileUpload = require("../middleware/file-upload");

const productControllers = require("../controllers/product-controllers");

// // /api/category
router.post("/category", productControllers.createCategory);

// /api/product
router.post(
  "/product",
  fileUpload.single("productImage"),
  productControllers.createProduct
);

// // /api/login
// // POST Login

// // /api/register
// // POST Register

// // /api/products
router.get("/product", productControllers.getAllProducts);

// // /api/category/:categoryId
router.get("/:productId", productControllers.getProductByProductId);

// // api/products/:productId
router.patch("/:productId", productControllers.updateProduct);

// // api/products/:productId
router.delete("/:productId", productControllers.deleteProduct);

module.exports = router;
