const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const Product = require('../models/product');
const { get } = require('mongoose');

// === Get all Products ===
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find(); // Fetch all products

    res.json({
      products: products.map((product) => product.toObject({ getters: true })),
    });
  } catch (err) {
    return next(
      new HttpError('Fetching products failed, please try again later.', 500)
    );
  }
};

// === Get Product by ID ===
const getProductById = async (req, res, next) => {
  const productId = req.params.pid;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return next(
        new HttpError('Could not find a product for the provided ID.', 404)
      );
    }

    res.json({ product: product.toObject({ getters: true }) });
  } catch (err) {
    return next(
      new HttpError('Fetching product failed, please try again later.', 500)
    );
  }
};

// === Create Product ===
const createProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { name, description } = req.body;
  const timestamp = new Date().toISOString();

  const createdProduct = new Product({
    name,
    description,
    create_date: timestamp,
    update_date: timestamp,
    status: true,
  });

  try {
    await createdProduct.save();
    res.status(201).json({ product: createdProduct });
  } catch (err) {
    const error = new HttpError(
      'Creating product failed, please try again.',
      500
    );
    return next(error);
  }
};

// === Update Product ===
const updateProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const productId = req.params.pid;
  const { name, description, status } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return next(
        new HttpError('Could not find product for the provided id.', 404)
      );
    }

    product.name = name;
    product.description = description;
    product.status = status;
    product.update_date = new Date().toISOString();

    await product.save();

    res.status(200).json({ product: product.toObject({ getters: true }) });
  } catch (err) {
    return next(
      new HttpError('Something went wrong, could not update product.', 500)
    );
  }
};

exports.getAllProducts = getAllProducts;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
