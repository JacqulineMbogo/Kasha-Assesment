const express = require('express');
const bodyParser = require('body-parser');

const staffRoutes = require('./routes/staff-routes');
const productRoutes = require('./routes/product-routes');
const customerRoutes = require('./routes/customer-routes');
const deliveryRoutes = require('./routes/delivery-routes');

const app = express();
app.use(express.json());

//apply cors middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

app.use('/api/staff', staffRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/deliveries', deliveryRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  next(error);
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const status = typeof error.code === 'number' ? error.code : 500;
  res
    .status(status)
    .json({ message: error.message || 'An unknown error occurred!' });
});

module.exports = app;
