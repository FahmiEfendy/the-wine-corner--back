const fs = require("fs");
const uuid = require("uuid");
const mysql = require("mysql2/promise");

const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const HttpError = require("../models/http-error");

const getAllProducts = async (req, res, next) => {
  const { productType, productSearch } = req.query;

  let allProducts;

  try {
    allProducts = await mysqlPool.query(
      `SELECT c.productCategoryId as __id, c.productPath, c.productType, JSON_ARRAYAGG( JSON_OBJECT('productID',p.productID,'productName', p.productName, 'productPrice', p.productPrice, 'productImage', p.productImage)) AS products 
      FROM categories c 
      LEFT JOIN products p ON c.productCategoryId = p.productCategoryId 
      WHERE p.productCategoryId IS NOT NULL 
      GROUP BY c.productCategoryId, c.productPath, c.productType;`
    );
  } catch (err) {
    return next(
      new HttpError(`Cannot get all categories because of ${err.message}`, 500)
    );
  }

  if (productType) {
    try {
      allProducts = await mysqlPool.query(
        `SELECT c.productCategoryId AS __id, c.productPath, c.productType, JSON_ARRAYAGG(
            JSON_OBJECT('productID', p.productID, 'productName', p.productName, 'productPrice', p.productPrice, 'productImage', p.productImage)
            ) AS products
        FROM categories c
        JOIN products p ON c.productCategoryId = p.productCategoryId
        WHERE c.productType = ?
        GROUP BY c.productCategoryId, c.productPath, c.productType;`,
        [productType]
      );
    } catch (err) {
      return next(
        new HttpError(
          `Cannot filter all product with product type of ${productType} because of ${err.message}`,
          500
        )
      );
    }
  }

  if (productSearch) {
    try {
      allProducts = await mysqlPool.query(
        `SELECT c.productCategoryId as __id, c.productPath, c.productType, JSON_ARRAYAGG( JSON_OBJECT('productId',p.productId,'productName', p.productName, 'productPrice', p.productPrice, 'productImage', p.productImage)) AS products 
        FROM categories c 
        LEFT JOIN products p ON c.productCategoryId = p.productCategoryId 
        WHERE p.productCategoryId IS NOT NULL AND p.productName LIKE ?
        GROUP BY c.productCategoryId, c.productPath, c.productType;`,
        [`%${productSearch}%`]
      );
    } catch (err) {
      console.log(err.message);
    }
  }

  allProducts = allProducts[0].map((category) => {
    const products = JSON.parse(category.products);
    return {
      ...category,
      products: products.map((product) => product),
    };
  });

  const totalProducts = allProducts.reduce((acc, curr) => {
    return acc + curr.products.length;
  }, 0);

  res.status(200).json({
    message: "Successfully get all products!",
    data: allProducts,
    length: totalProducts,
  });
};

const getProductRecommendation = async (req, res, next) => {
  const { productType, productId } = req.query;

  let allProducts;
  let recommendationProducts;

  if (!productType) {
    return next(
      new HttpError(
        `Cannot get all products for category of ${productType}`,
        500
      )
    );
  }

  try {
    allProducts = await mysqlPool.query(
      `SELECT * FROM categories WHERE productType = ?`,
      [productType]
    );
  } catch (err) {
    return next(
      new HttpError(
        `Cannot filter all product with product type of ${productType}`,
        500
      )
    );
  }

  const productCategoryId = allProducts[0].map((product) => {
    return { ...product };
  })[0].productCategoryId;

  if (!productId) {
    return next(
      new HttpError(`Cannot get a product with id of ${productId}`, 500)
    );
  }

  try {
    recommendationProducts = await mysqlPool.query(
      `SELECT * FROM products WHERE productCategoryId = ? AND productId != ? LIMIT 4`,
      [productCategoryId, productId]
    );
  } catch (err) {
    return next(
      new HttpError(
        `Cannot get product recommendation for ${productType} because of ${err.message}`
      )
    );
  }

  res.status(200).json({
    message: "Successfully get all products!!",
    data: recommendationProducts[0],
  });
};

const getProductByProductId = async (req, res, next) => {
  const { productId } = req.params;

  let selectedProduct;

  try {
    selectedProduct = await mysqlPool.query(
      "SELECT p.productName,p.productPrice,p.productImage, c.productType FROM products p INNER JOIN categories c ON p.productCategoryId = c.productCategoryId WHERE p.productId = ?;",
      [productId]
    );
  } catch (err) {
    return next(
      new HttpError(
        `Cannot find product with id of ${productId} because of ${err.message}`,
        500
      )
    );
  }

  if (selectedProduct.length === 0)
    return next(
      new HttpError(`There is no product with id of ${productId}`, 404)
    );

  res.status(200).json({
    message: `Successfully get a product with id of ${productId}`,
    data: selectedProduct[0],
  });
};

const createCategory = async (req, res, next) => {
  const { productPath, productType } = req.body;

  let id = uuid.v4();

  try {
    await mysqlPool.query(
      "INSERT INTO categories (productCategoryId ,productPath, productType) VALUES (? ,?, ?)",
      [id, productPath, productType]
    );
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
    data: { productCategoryId: id, productPath, productType },
  });
};

const createProduct = async (req, res, next) => {
  const { productName, productPrice, productCategoryId } = req.body;

  let id = uuid.v4();

  let category;
  // Find category
  try {
    const [result] = await mysqlPool.query(
      "SELECT * FROM categories WHERE productCategoryId = ?",
      [productCategoryId]
    );
    category = result;
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
        `Failed to find a category with id of ${productCategoryId}`,
        404
      )
    );
  }

  const newProduct = {
    productId: id,
    productName,
    productPrice,
    productImage: req.file.path,
    productCategoryId,
  };

  let createdProduct;
  try {
    const [result] = await mysqlPool.query("INSERT INTO products SET ?", [
      newProduct,
    ]);
    createdProduct = { ...newProduct, productId: id };
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
    data: createdProduct,
  });
};

const updateProduct = async (req, res, next) => {
  const { productId } = req.params;
  const { productName, productPrice, productCategoryId } = req.body;

  let selectedProduct;

  try {
    const [result] = await mysqlPool.query(
      "SELECT * FROM products WHERE productId = ?",
      [productId]
    );
    selectedProduct = result;
  } catch (err) {
    throw new Error(
      `Cannot find product with id of ${productId} because of ${err.message}`
    );
  }

  if (!selectedProduct)
    return next(
      new HttpError(`There is no product with id of ${productId}`, 404)
    );

  let newImage = req.file.path || selectedProduct[0].productImage;
  if (
    newImage !== selectedProduct[0].productImage &&
    selectedProduct[0].productImage !== null
  ) {
    fs.unlink(selectedProduct[0].productImage, (err) => console.log(err));
  }

  const updatedProduct = {
    productName,
    productPrice,
    productImage: newImage,
    productCategoryId,
  };

  try {
    await mysqlPool.query("UPDATE products SET ? WHERE productId = ?", [
      updatedProduct,
      productId,
    ]);
  } catch (err) {
    return next(
      new HttpError(
        `Failed to update a product with id of ${productId} because of ${err.message}`,
        500
      )
    );
  }
  res.status(200).json({
    message: "Successfully update a product!",
    data: updatedProduct,
  });
};

const deleteProduct = async (req, res, next) => {
  const { productId } = req.params;

  // Find product
  let selectedProduct;
  try {
    const [result] = await mysqlPool.query(
      "SELECT * FROM products WHERE productId = ?",
      [productId]
    );
    selectedProduct = result;
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
    const [result] = await mysqlPool.query(
      "SELECT * FROM categories WHERE productCategoryId = ?",
      [selectedProduct.productCategory]
    );
    selectedCategory = result;
  } catch (err) {
    return next(
      new HttpError(`Cannot find a category because of ${err.message}`, 500)
    );
  }

  if (!selectedCategory)
    return next(
      new HttpError(
        `There is no category with id of ${selectedProduct.productCategory}`,
        404
      )
    );

  const imagePath = `${selectedProduct[0].productImage}`;

  try {
    await mysqlPool.query("DELETE FROM products WHERE productId = ?", [
      productId,
    ]);
    fs.unlink(imagePath, (err) => err && console.log(err));
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
exports.getProductRecommendation = getProductRecommendation;

exports.updateProduct = updateProduct;

exports.deleteProduct = deleteProduct;
