const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
  unique_identifier: {
    type: String,
    trim: true,
  },
  primary_phone: {
    type: String,
    required: true,
    unique: true,
  },
  alternate_phone: {
    type: String,
  },
  sex: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER'],
    required: true,
  },
  age: {
    type: Number,
    min: 0,
    required: true,
  },
  client_type: {
    type: String,
  },
  sub_county: {
    type: String,
  },
});

module.exports = mongoose.model('Customer', customerSchema);
