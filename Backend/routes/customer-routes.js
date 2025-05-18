const express = require('express');
const { check } = require('express-validator');

const customerControllers = require('../controllers/customer-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// Middleware to authenticate user
router.use(checkAuth);

// GET all customers
router.get('/all', customerControllers.getAllCustomers);

// GET customer by ID
router.get('/:cid', customerControllers.getCustomerById);

// POST create new customer
router.post(
  '/',
  [
    check('full_name').not().isEmpty(),
    check('primary_phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^(\+254|0)[17]\d{8}$/)
      .withMessage('Invalid phone number format'),
    check('alternate_phone')
      .optional()
      .matches(/^(\+254|0)[17]\d{8}$/)
      .withMessage('Invalid phone number format'),
    check('sex').notEmpty().withMessage('Gender is required'),
    check('age').isInt({ min: 0 }),
    check('client_type').optional(),
    check('sub_county').optional(),
  ],
  customerControllers.createCustomer
);

// PATCH update customer
router.patch('/:cid', customerControllers.updateCustomer);

module.exports = router;
