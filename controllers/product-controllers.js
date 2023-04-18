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
    data: newProduct.toObject({ getters: true }),
  });
};

const getAllCategories = async (req, res, next) => {
  let allCategories;

  try {
    allCategories = await Category.find();
  } catch (err) {
    throw new Error(`Cannot get all category because of ${err.message}`);
  }

  res
    .status(200)
    .json({ message: "Successfully get all categories!", data: allCategories });
};

const getAllProducts = async (req, res, next) => {
  let allProducts;

  try {
    allProducts = await Category.find().populate("products");
  } catch (err) {
    throw new Error(`Cannot get all categories because of ${err.message}`);
  }

  res
    .status(200)
    .json({ message: "Successfully get all products!", data: allProducts });
};

const getProductByProductId = async (req, res, next) => {
  const { productId } = req.params;

  let selectedProduct;

  try {
    selectedProduct = await Product.findById(productId);
  } catch (err) {
    throw new Error(
      `Cannot find product with id of ${productId} because of ${err.message}`
    );
  }

  res.status(200).json({
    message: `Successfully get a product with id of ${productId}`,
    data: selectedProduct,
  });
};

const getAllProductsByProductCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  let allProductsByCategory;

  try {
    allProductsByCategory = await Category.findById(categoryId).populate(
      "products"
    );
  } catch (err) {
    throw new Error(
      `Cannot find all products for specific category because of ${err.message}`
    );
  }

  res.status(200).json({
    message: "Successfully get all products for specific category!",
    data: allProductsByCategory,
  });
};

const updateProduct = async (req, res, next) => {
  const { productId } = req.params;
  const { productName, productPrice } = req.body;

  let selectedProduct;

  try {
    selectedProduct = await Product.findById(productId);
  } catch (err) {
    throw new Error(
      `Cannot find product with id of ${productId} because of ${err.message}`
    );
  }

  selectedProduct.productName = productName;
  selectedProduct.productPrice = productPrice;

  try {
    await selectedProduct.save();
  } catch (err) {
    throw new Error(
      `Failed to update a product with id of ${productId}, because ${err.message}`
    );
  }

  res.status(200).json({
    message: "Successfully update a product!",
    data: selectedProduct.toObject({ getters: true }),
  });
};

const deleteProduct = async (req, res, next) => {
  const { productId } = req.params;

  // Find product
  let selectedProduct;
  try {
    selectedProduct = await Product.findById(productId).populate(
      "productCategoryId"
    );
  } catch (err) {
    throw new Error(
      `Cannot find a product with id of ${productId} because of ${err.message}`
    );
  }

  if (!selectedProduct)
    throw new Error(`Cannot find a product with id of ${productId}`);

  // Find category
  let selectedCategory;
  try {
    selectedCategory = await Category.findById(
      selectedProduct.productCategoryId.id
    );
  } catch (err) {
    throw new Error(`Cannot find a category because of ${err.message}`);
  }

  if (!selectedCategory)
    throw new Error(
      `There is no category with id of ${selectedProduct.productCategoryId.id}`
    );

  try {
    await selectedProduct.deleteOne();
    selectedProduct.productCategoryId.products.pull(selectedProduct);
    await selectedProduct.productCategoryId.save();
  } catch (err) {
    throw new Error(
      `Failed to delete a product with id of ${productId} because of ${err.message}`
    );
  }

  res.status(202).json({
    message: "Successfully deleted a product!",
  });
};

exports.createProduct = createProduct;
exports.createCategory = createCategory;

exports.getAllProducts = getAllProducts;
exports.getAllCategories = getAllCategories;
exports.getProductByProductId = getProductByProductId;
exports.getAllProductsByProductCategory = getAllProductsByProductCategory;

exports.updateProduct = updateProduct;

exports.deleteProduct = deleteProduct;
