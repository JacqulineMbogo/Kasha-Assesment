const mongoose = require('mongoose');

const excelUploadSchema = new mongoose.Schema({
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
  },
  upload_date: {
    type: Date,
    default: Date.now,
  },
  filename: {
    type: String,
    required: true,
  },
  valid_records: {
    type: Number,
    required: true,
  },
  invalid_records: {
    type: Number,
    required: true,
  },
  error_log: {
    type: String, // could be a file path or URL to error log
    default: '',
  },
});

module.exports = mongoose.model('ExcelUpload', excelUploadSchema);
