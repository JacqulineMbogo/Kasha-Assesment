const { validationResult } = require('express-validator');
const xlsx = require('xlsx');

const HttpError = require('../models/http-error');
const excelUpload = require('../models/excel-uploads');
const Customer = require('../models/customer');
const { formatPhone } = require('../shared/utility');

// === Normalize header keys ===
const normalizeHeader = (header) => {
  return String(header)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[()]/g, '') // Remove parentheses
    .replace(/[^a-z0-9-_]/g, ''); // Remove special characters
};

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
  if (!req.file) return next(new HttpError('No file uploaded', 400));

  const shouldSave = req.query.save === 'true';
  const workbook = xlsx.readFile(req.file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headers = rawData[0].map(normalizeHeader);
  const rows = rawData
    .slice(1)
    .filter((row) =>
      row.some((cell) => cell !== '' && cell !== null && cell !== undefined)
    ) // ⛔ skip empty rows
    .map((row) => Object.fromEntries(row.map((val, i) => [headers[i], val])));

  const requiredFields = [
    'facility-name-official-names',
    'primary-phone-number',
    'sex',
    'client-age',
    'client-type',
    'sub-county-of-residence',
    'client-prefered-delivery-date',
    'delivery-type',
    'delivery-package',
    'delivery-outcome',
    'actual-delivery-date',
    'delivery-geocordinates',
  ];

  const pendingUpdates = [], // needed customer updates
    pendingInserts = [], // new customers to be created
    deliveryQueue = [], // queue to insert deliveries - everythng passed
    errors = []; // errors in the file

  //Error codes
  const errorCodes = {
    100: 'Missing required fields',
    101: 'Customer ID not found',
  };

  // Preload all existing customers in this batch
  const uids = rows.map((r) => r['unique-identifier']).filter(Boolean);
  const existingCustomers = await Customer.find({
    unique_identifier: { $in: uids },
  });
  const customerMap = Object.fromEntries(
    existingCustomers.map((c) => [c.unique_identifier, c])
  );

  for (const row of rows) {
    const uid = row['unique-identifier']?.trim();

    // Check for required fields
    const missing = requiredFields.filter((f) => {
      const value = row[f];
      return !value || value.toString().trim() === '';
    });
    if (missing.length) {
      errors.push({
        errorCodes: 100,
        row,
        reason: `Missing required fields: ${missing.join(', ')}`,
      });
      continue;
    }

    const customerData = {
      unique_identifier: row['unique-identifier'],
      primary_phone: formatPhone(row['primary-phone-number']),
      alternate_phone: formatPhone(row['alternate-phone-number']),
      sex: normalizeSex(row['sex']),
      age: parseInt(row['client-age']),
      client_type: row['client-type'],
      sub_county: row['sub-county-of-residence'],
    };

    const deliveryData = {
      facility_name: row['facility-name-official-names'],
      status: row['delivery-outcome'].toLowerCase(),
      last_vl_date: parseDate(row['last-vl-date']),
      tca_date: parseDate(row['drug-refill-date-tca']),
      preferred_date: parseDate(row['client-prefered-delivery-date']),
      actual_date: parseDate(row['actual-delivery-date']),
      preferred_location: row['client-prefered-delivery-location'],
      actual_location: row['actual-delivery-location'],
      geolocation: row['delivery-geocordinates'],
      delivery_time: parseTime(row['delivery-time']),
      meds_returned:
        row['medication-returned-to-site']?.toLowerCase() === 'yes',
      signed_by_client: true,
      comments: row['comments'],
      rider_name: row['name-of-rider-making-delivery'],
    };

    if (uid) {
      const customer = customerMap[uid];
      if (customer) {
        const changed = hasChanged(customer, customerData);
        if (changed) {
          pendingUpdates.push({
            existing: customer,
            incoming: customerData,
            delivery: deliveryData,
          });
          continue;
        }
        deliveryQueue.push({
          customer_id: customer._id,
          delivery: deliveryData,
        });
      } else {
        errors.push({
          errorCodes: 101,
          row,
          reason: `Customer ID ${uid} not found`,
        });
      }
    } else {
      pendingInserts.push({ customer: customerData, delivery: deliveryData });
    }
  }

  // if (shouldSave) {
  //   try {
  //     const log = new excelUpload({
  //       uploaded_by: req.userData.userId,
  //       filename: req.file.originalname,
  //       valid_records: deliveryQueue.length,
  //       invalid_records: errors.length,
  //       error_log: '',
  //     });
  //     await log.save();
  //   } catch (err) {
  //     console.error('Upload log error:', err);
  //   }
  // }

  res
    .status(200)
    .json({ pendingUpdates, pendingInserts, deliveryQueue, errors });
};

function normalizeSex(value) {
  if (!value) return 'OTHER';
  const val = value.toString().trim().toUpperCase();
  if (val === 'M') return 'MALE';
  if (val === 'F') return 'FEMALE';
  if (['MALE', 'FEMALE', 'OTHER'].includes(val)) return val;
  return 'OTHER'; // fallback for invalid or unexpected entries
}

function hasChanged(existing, incoming) {
  return (
    existing.unique_identifier !== incoming.unique_identifier ||
    formatPhone(existing.primary_phone) !==
      formatPhone(incoming.primary_phone) ||
    normalizeSex(existing.sex) !== normalizeSex(incoming.sex) ||
    existing.age !== incoming.age ||
    existing.sub_county !== incoming.sub_county
  );
}

function parseDate(value) {
  if (!value || value.toString().toLowerCase() === 'none') return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function parseTime(label) {
  const map = {
    Morning: '08:00:00',
    Afternoon: '13:00:00',
    Evening: '17:00:00',
  };
  return new Date(`1970-01-01T${map[label] || '12:00:00'}Z`);
}

exports.getAllUploads = getAllUploads;
exports.createUpload = createUpload;
exports.getUploadById = getUploadById;
exports.getUploadsByStaffId = getUploadsByStaffId;
