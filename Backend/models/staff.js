const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

// Create a schema for the user
const staffSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    email: { type: String, required: true, unique: true },
    create_date: { type: Date, default: Date.now },
    update_date: { type: Date, default: Date.now }
});

staffSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Staff', staffSchema);