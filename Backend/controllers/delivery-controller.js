const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const Delivery = require('../models/delivery');

// === Get all deliveries ===
const getAllDeliveries = async (req, res, next) => {
  try {
    const deliveries = await Delivery.find().populate('customer_id staff_id product_id');
    res.json({
      deliveries: deliveries.map(delivery => delivery.toObject({ getters: true }))
    });
  } catch (err) {
    return next(new HttpError('Fetching deliveries failed, please try again later.', 500));
  }
};

// === Get delivery by ID ===
const getDeliveryById = async (req, res, next) => {
  const deliveryId = req.params.did;

  try {
    const delivery = await Delivery.findById(deliveryId).populate('customer_id staff_id product_id');
    if (!delivery) {
      return next(new HttpError('Could not find a delivery for the provided ID.', 404));
    }
    res.json({ delivery: delivery.toObject({ getters: true }) });
  } catch (err) {
    return next(new HttpError('Fetching delivery failed, please try again later.', 500));
  }
};

// === Create delivery ===
const createDelivery = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const {
    customer_id,
    staff_id,
    product_id,
    facility_name,
    status,
    last_vl_date,
    tca_date,
    preferred_date,
    actual_date,
    preferred_location,
    actual_location,
    geolocation,
    delivery_time,
    meds_returned,
    signed_by_client,
    comments
  } = req.body;

  const newDelivery = new Delivery({
    customer_id,
    staff_id,
    product_id,
    facility_name,
    status,
    last_vl_date,
    tca_date,
    preferred_date,
    actual_date,
    preferred_location,
    actual_location,
    geolocation,
    delivery_time,
    meds_returned,
    signed_by_client,
    comments
  });

  try {
    await newDelivery.save();
    res.status(201).json({ delivery: newDelivery });
  } catch (err) {
    return next(new HttpError('Creating delivery failed, please try again.', 500));
  }
};

// === Update delivery ===
const updateDelivery = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const deliveryId = req.params.did;
  const {
    status,
    actual_date,
    actual_location,
    geolocation,
    delivery_time,
    meds_returned,
    signed_by_client,
    comments
  } = req.body;

  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return next(new HttpError('Could not find delivery for the provided ID.', 404));
    }

    delivery.status = status;
    delivery.actual_date = actual_date;
    delivery.actual_location = actual_location;
    delivery.geolocation = geolocation;
    delivery.delivery_time = delivery_time;
    delivery.meds_returned = meds_returned;
    delivery.signed_by_client = signed_by_client;
    delivery.comments = comments;

    await delivery.save();

    res.status(200).json({ delivery: delivery.toObject({ getters: true }) });
  } catch (err) {
    return next(new HttpError('Updating delivery failed.', 500));
  }
};

exports.getAllDeliveries = getAllDeliveries;
exports.getDeliveryById = getDeliveryById;
exports.createDelivery = createDelivery;
exports.updateDelivery = updateDelivery;
