const express = require('express');
const { check } = require('express-validator');

const productControllers = require('../controllers/product-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// Middleware to authenticate user
router.use(checkAuth);

// GET all product
router.get('/all', productControllers.getAllProducts);
// GET product by ID
router.get('/:pid', productControllers.getProductById);
// POST create product
router.post(
  '/',
  [
    check('name').not().isEmpty(),
    check('description').isLength({ min: 10 }),
    check('status').not().isEmpty(),
  ],
  productControllers.createProduct
);
// PATCH update product
router.patch('/:pid', productControllers.updateProduct);

module.exports = router;
