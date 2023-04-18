const express = require("express");

const router = express.Router();

const productControllers = require("../controllers/product-controllers");

// /api/product/products
router.post("/products", productControllers.createProduct);

// /api/product/category
router.post("/category", productControllers.createCategory);

// /api/product/products
router.get("/products", productControllers.getAllProducts);

// /api/product/category
router.get("/category", productControllers.getAllCategories);

// /api/product/products/:productId
router.get("/products/:productId", productControllers.getProductByProductId);

// /api/product/category/:categoryId
router.get(
  "/category/:categoryId",
  productControllers.getAllProductsByProductCategory
);

// api/product/products/:productId
router.patch("/products/:productId", productControllers.updateProduct);

module.exports = router;
