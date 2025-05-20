const express = require('express');
const { check } = require('express-validator');

const deliveryControllers = require('../controllers/delivery-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// Middleware: protect all routes
router.use(checkAuth);

// GET all deliveries
router.get('/all', deliveryControllers.getAllDeliveries);

// GET delivery by ID
router.get('/:did', deliveryControllers.getDeliveryById);

// POST create delivery
router.post(
  '/',
  [
    check('customer_id').notEmpty(),
    check('staff_id').notEmpty(),
    check('product_id').notEmpty(),
    check('facility_name').notEmpty(),
    check('status').isIn(['pending', 'delivered', 'failed', 'partial']),
    check('delivery_time').isIn(['morning', 'afternoon', 'evening']),
  ],
  deliveryControllers.createDelivery
);

// PATCH update delivery
router.patch('/:did', deliveryControllers.updateDelivery);

module.exports = router;
