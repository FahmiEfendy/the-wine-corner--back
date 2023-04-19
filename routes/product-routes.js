const express = require("express");

const router = express.Router();

const checkAuth = require("../middleware/check-auth");
const fileUpload = require("../middleware/file-upload");

const productControllers = require("../controllers/product-controllers");

// /api/products
router.get("/product", productControllers.getAllProducts);

// /api/recommendation
router.get("/recommendation", productControllers.getProductRecommendation);

// /api/:productType/:productId
router.get(
  "/:productType/:productId",
  productControllers.getProductByProductId
);

router.use(checkAuth);

// /api/category
router.post("/category", productControllers.createCategory);

// /api/product
router.post(
  "/product",
  fileUpload.single("productImage"),
  productControllers.createProduct
);

// api/products/:productId
router.patch("/:productId", productControllers.updateProduct);

// api/products/:productId
router.delete("/:productId", productControllers.deleteProduct);

module.exports = router;
