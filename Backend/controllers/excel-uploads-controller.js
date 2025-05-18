const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const excelUpload = require('../models/excel-uploads');

// === Get all uploads ===
const getAllUploads = async (req, res, next) => {
  try {
    const uploads = await excelUpload.find().populate('uploaded_by');
    res.json({
      uploads: uploads.map((upload) => upload.toObject({ getters: true })),
    });
  } catch (err) {
    return next(new HttpError('Fetching upload history failed.', 500));
  }
};

// === Get upload log by ID ===
const getUploadById = async (req, res, next) => {
  const uploadId = req.params.uid;

  try {
    const upload = await excelUpload.findById(uploadId).populate('uploaded_by');
    if (!upload) {
      return next(new HttpError('No upload found for the provided ID.', 404));
    }

    res.json({ upload: upload.toObject({ getters: true }) });
  } catch (err) {
    return next(new HttpError('Fetching upload failed.', 500));
  }
};

// === Get uploads by staff ID ===
const getUploadsByStaffId = async (req, res, next) => {
  const staffId = req.params.sid;

  try {
    const uploads = await excelUpload
      .find({
        uploaded_by: staffId,
      })
      .populate('uploaded_by');

    if (!uploads || uploads.length === 0) {
      return next(
        new HttpError('No uploads found for the provided staff ID.', 404)
      );
    }

    res.json({
      uploads: uploads.map((upload) => upload.toObject({ getters: true })),
    });
  } catch (err) {
    return next(new HttpError('Fetching uploads by staff failed.', 500));
  }
};

// === Create upload log ===
const createUpload = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid input data.', 422));
  }

  const { uploaded_by, filename, valid_records, invalid_records, error_log } =
    req.body;

  const newUpload = new excelUpload({
    uploaded_by,
    filename,
    valid_records,
    invalid_records,
    error_log,
  });

  try {
    await newUpload.save();
    res.status(201).json({ upload: newUpload });
  } catch (err) {
    return next(new HttpError('Saving upload log failed.', 500));
  }
};

exports.getAllUploads = getAllUploads;
exports.createUpload = createUpload;
exports.getUploadById = getUploadById;
exports.getUploadsByStaffId = getUploadsByStaffId;
