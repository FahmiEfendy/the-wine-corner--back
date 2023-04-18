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

module.exports = router;
