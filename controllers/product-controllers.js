const fs = require("fs");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");

const Product = require("../models/product-models");
const Category = require("../models/category-models");

const getAllProducts = async (req, res, next) => {
  const { productType, productSearch } = req.query;

  let allProducts;

  try {
    allProducts = await Category.find().populate("products");
  } catch (err) {
    return next(
      new HttpError(`Cannot get all categories because of ${err.message}`, 500)
    );
  }
  // console.log(allProducts);

  if (productType) {
    try {
      allProducts = await Category.find({ productType: productType }).populate(
        "products"
      );
    } catch (err) {
      return next(
        new HttpError(
          `Cannot filter all product with product type of ${productType}`,
          500
        )
      );
    }
  }

  if (productSearch) {
    try {
      const regex = new RegExp(productSearch, "i");
      allProducts = await Category.find().populate({
        path: "products",
        match: { productName: regex },
      });
    } catch (err) {
      console.log(err.message);
    }
  }

  const totalProducts = allProducts.reduce((acc, curr) => {
    return acc + curr.products.length;
  }, 0);

  res.status(200).json({
    message: "Successfully get all products!",
    data: allProducts.map((product) => product.toObject({ getters: true })),
    length: totalProducts,
  });
};

const getProductRecommendation = async (req, res, next) => {
  const { productType, productId } = req.query;

  let allProducts;

  try {
    allProducts = await Category.find().populate("products");
  } catch (err) {
    return next(
      new HttpError(`Cannot get all categories because of ${err.message}`, 500)
    );
  }

  if (!productType) {
    return next(
      new HttpError(
        `Cannot get all products for categroy of ${productType}`,
        500
      )
    );
  }

  try {
    allProducts = await Category.find({ productType: productType }).populate(
      "products"
    );
  } catch (err) {
    return next(
      new HttpError(
        `Cannot filter all product with product type of ${productType}`,
        500
      )
    );
  }

  if (!productId) {
    return next(
      new HttpError(`Cannot get a product with id of ${productId}`, 500)
    );
  }

  try {
    allProducts = allProducts[0].products
      .filter((product) => product.id !== productId)
      .slice(0, 4);
  } catch (err) {
    return next(
      new HttpError(
        `Cannot get product recommendation for ${productType} because of ${err.message}`
      )
    );
  }

  res.status(200).json({
    message: "Successfully get all products!",
    data: allProducts.map((product) => product.toObject({ getters: true })),
  });
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
  const { productName, productPrice, productCategory } = req.body;

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

  if (!category) {
    return next(
      new HttpError(
        `Failed to find a category with id of ${productCategory}`,
        404
      )
    );
  }

  const newProduct = new Product({
    productName,
    productPrice,
    productImage: req.file.path,
    productCategory,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newProduct.save({ session: sess });
    category.products.push(newProduct);
    await category.save({ session: sess });
    await sess.commitTransaction();
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

const updateProduct = async (req, res, next) => {
  const { productId } = req.params;
  const { productName, productPrice, productCategory } = req.body;

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
  selectedProduct.productCategory = productCategory;

  try {
    if (req.file) {
      const newImage = req.file.path;

      if (newImage !== selectedProduct.productImage) {
        fs.unlink(selectedProduct.productImage, (err) => console.log(err));
      }

      selectedProduct.productImage = newImage;
    }

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

  const imagePath = selectedProduct.productImage;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await selectedProduct.deleteOne({ session: sess });
    selectedProduct.productCategory.products.pull(selectedProduct);
    await selectedProduct.productCategory.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new HttpError(
        `Failed to delete a product with id of ${productId} because of ${err.message}`,
        500
      )
    );
  }

  fs.unlink(imagePath, (err) => err && console.log(err));

  res.status(200).json({
    message: "Successfully deleted a product!",
  });
};

exports.createProduct = createProduct;
exports.createCategory = createCategory;

exports.getAllProducts = getAllProducts;
exports.getProductByProductId = getProductByProductId;
exports.getProductRecommendation = getProductRecommendation;

exports.updateProduct = updateProduct;

exports.deleteProduct = deleteProduct;
