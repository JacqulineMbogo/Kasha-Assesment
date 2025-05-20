const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const Customer = require('../models/customer');

const { formatPhone } = require('../shared/utility');

// === Get all Customers ===
const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find();

    res.json({
      customers: customers.map((customer) =>
        customer.toObject({ getters: true })
      ),
    });
  } catch (err) {
    return next(
      new HttpError('Fetching customers failed, please try again later.', 500)
    );
  }
};

// === Get Customer by ID ===
const getCustomerById = async (req, res, next) => {
  const customerId = req.params.cid;

  try {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return next(
        new HttpError('Could not find a customer for the provided ID.', 404)
      );
    }

    res.json({ customer: customer.toObject({ getters: true }) });
  } catch (err) {
    return next(
      new HttpError('Fetching customer failed, please try again later.', 500)
    );
  }
};

// === Create Customer ===
const createCustomer = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const {
    unique_identifier,
    primary_phone,
    alternate_phone,
    sex,
    age,
    client_type,
    sub_county,
  } = req.body;

  //unique identifier should be uniqur
  const existingCustomer = await Customer.findOne({
    unique_identifier,
  });
  if (existingCustomer) {
    return next(
      new HttpError('Customer with this unique identifier already exists.', 422)
    );
  }

  // Check if primary phone number already exists

  const newCustomer = new Customer({
    unique_identifier,
    primary_phone: formatPhone(primary_phone),
    alternate_phone: formatPhone(alternate_phone),
    sex,
    age,
    client_type,
    sub_county,
  });

  try {
    await newCustomer.save();
    res.status(201).json({ customer: newCustomer });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern.primary_phone) {
      return next(new HttpError('Phone number already exists.', 422));
    }
    return next(
      new HttpError('Creating customer failed, please try again.', 500)
    );
  }
};

// === Update Customer ===
const updateCustomer = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const customerId = req.params.cid;
  const {
    unique_identifier,
    primary_phone,
    alternate_phone,
    sex,
    age,
    client_type,
    sub_county,
  } = req.body;

  try {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return next(
        new HttpError('Could not find customer for the provided id.', 404)
      );
    }

    customer.unique_identifier = unique_identifier;
    customer.primary_phone = formatPhone(primary_phone);
    customer.alternate_phone = formatPhone(alternate_phone);
    customer.sex = sex;
    customer.age = age;
    customer.client_type = client_type;
    customer.sub_county = sub_county;

    await customer.save();

    res.status(200).json({ customer: customer.toObject({ getters: true }) });
  } catch (err) {
    return next(
      new HttpError('Something went wrong, could not update customer.', 500)
    );
  }
};

exports.getAllCustomers = getAllCustomers;
exports.getCustomerById = getCustomerById;
exports.createCustomer = createCustomer;
exports.updateCustomer = updateCustomer;
