const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  staff_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  facility_name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'delivered', 'failed', 'partial'],
    required: true,
  },
  last_vl_date: Date,
  tca_date: Date,
  preferred_date: Date,
  actual_date: Date,
  preferred_location: String,
  actual_location: String,
  geolocation: String, // lat,lng or GeoJSON string
  delivery_time: Date,
  meds_returned: Boolean,
  signed_by_client: Boolean,
  comments: String,
});

module.exports = mongoose.model('Delivery', deliverySchema);
