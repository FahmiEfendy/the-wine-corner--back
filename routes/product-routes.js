const express = require("express");

const router = express.Router();

const productControllers = require("../controllers/product-controllers");

// /api/product/category
router.post("/category", productControllers.createCategory);

// /api/product/products
router.post("/products", productControllers.createProduct);

module.exports = router;
