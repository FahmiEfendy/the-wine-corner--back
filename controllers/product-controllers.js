const mongoose = require("mongoose");

const HttpError = require("../models/http-error");

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
    return next(
      new HttpError(
        `Failed to create new category because of ${err.message}`,
        500
      )
    );
  }

  res.status(201).json({
    message: "Successfully add new category!",
    data: newCategory.toObject({ getters: true }),
  });
};

const createProduct = async (req, res, next) => {
  const { productName, productPrice, productImage, productCategory } = req.body;

  let category;
  // Find category
  try {
    category = await Category.findById(productCategory);
  } catch (err) {
    return next(
      new HttpError(
        `Failed to create new category because of ${err.message}`,
        500
      )
    );
  }

  const newProduct = new Product({
    productName,
    productPrice,
    productImage,
    productCategory,
  });

  try {
    await newProduct.save();
    category.products.push(newProduct);
    await category.save();
  } catch (err) {
    return next(
      new HttpError(
        `Failed to create new product because of ${err.message}`,
        500
      )
    );
  }

  res.status(201).json({
    message: "Successfully add new product!,",
    data: newProduct.toObject({ getters: true }),
  });
};

const getAllProducts = async (req, res, next) => {
  const { productType } = req.query;

  let allProducts;

  try {
    allProducts = await Category.find().populate("products");
  } catch (err) {
    return next(
      new HttpError(`Cannot get all categories because of ${err.message}`, 500)
    );
  }

  if (productType) {
    allProducts = allProducts.filter(
      (product) => product.productType === productType
    );
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
    return next(
      new HttpError(
        `Cannot find product with id of ${productId} because of ${err.message}`,
        500
      )
    );
  }

  if (!selectedProduct)
    return next(
      new HttpError(`There is no product with id of ${productId}`, 404)
    );

  res.status(200).json({
    message: `Successfully get a product with id of ${productId}`,
    data: selectedProduct.toObject({ getters: true }),
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

  if (!selectedProduct)
    return next(
      new HttpError(`There is no product with id of ${productId}`, 404)
    );

  selectedProduct.productName = productName;
  selectedProduct.productPrice = productPrice;

  try {
    await selectedProduct.save();
  } catch (err) {
    return next(
      new HttpError(
        `Faled to update a product with id of ${productId} because of ${err.message}`,
        500
      )
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
      "productCategory"
    );
  } catch (err) {
    return next(
      new HttpError(
        `Cannot find a product with id of ${productId} because of ${err.message}`,
        500
      )
    );
  }

  if (!selectedProduct)
    return next(
      new HttpError(`Cannot find a product with id of ${productId}`, 404)
    );

  // Find category
  let selectedCategory;
  try {
    selectedCategory = await Category.findById(
      selectedProduct.productCategory.id
    );
  } catch (err) {
    return next(
      new HttpError(`Cannot find a category because of ${err.message}`, 500)
    );
  }

  if (!selectedCategory)
    return next(
      new HttpError(
        `There is no category with id of ${selectedProduct.productCategory.id}`,
        404
      )
    );

  try {
    await selectedProduct.deleteOne();
    selectedProduct.productCategory.products.pull(selectedProduct);
    await selectedProduct.productCategory.save();
  } catch (err) {
    return next(
      new HttpError(
        `Failed to delete a product with id of ${productId} because of ${err.message}`,
        500
      )
    );
  }

  res.status(200).json({
    message: "Successfully deleted a product!",
  });
};

exports.createProduct = createProduct;
exports.createCategory = createCategory;

exports.getAllProducts = getAllProducts;
exports.getProductByProductId = getProductByProductId;

exports.updateProduct = updateProduct;

exports.deleteProduct = deleteProduct;
