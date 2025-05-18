const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a schema for the product
const productSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 5 characters'],
    maxlength: [60, 'Name must be at most 60 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description must be at most 500 characters'],
  },
  create_date: { type: Date, default: Date.now },
  update_date: { type: Date, default: Date.now },
  status: { type: Boolean, default: true },
});

module.exports = mongoose.model('Product', productSchema);
