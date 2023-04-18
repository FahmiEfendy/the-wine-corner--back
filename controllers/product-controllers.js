const mongoose = require("mongoose");

const Product = require("../models/product-models");
const Category = require("../models/category-models");

const createCategory = async (req, res, next) => {
  const { productPath, productType } = req.body;

  const newCategory = new Category({
    productPath,
    productType,
    products: [],
  });

  try {
    await newCategory.save();
  } catch (err) {
    throw new Error(`Failed to add new category because of ${err.message}`);
  }

  res
    .status(201)
    .json({ message: "Successfully add new category!", data: newCategory });
};
const createProduct = async (req, res, next) => {
  const { productName, productPrice, productImage, productCategoryId } =
    req.body;

  let category;
  // Find category
  try {
    category = await Category.findById(productCategoryId);
  } catch (err) {
    throw new Error(`Failed to find a category because of ${err.message}`);
  }

  const newProduct = new Product({
    productName,
    productPrice,
    productImage,
    productCategoryId,
  });

  try {
    await newProduct.save();
    category.products.push(newProduct);
    await category.save();
  } catch (err) {
    throw new Error(`Failed to add a product because of ${err.message}`);
  }

  res.status(201).json({
    message: "Successfully add new product!,",
    data: newProduct,
  });
};

exports.createCategory = createCategory;
exports.createProduct = createProduct;
