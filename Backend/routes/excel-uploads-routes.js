const express = require('express');
const { check } = require('express-validator');

const excelUploadControllers = require('../controllers/excel-uploads-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// Require JWT
router.use(checkAuth);

// GET all upload logs
router.get('/all', excelUploadControllers.getAllUploads);

// GET upload log by ID
router.get('/:uid', excelUploadControllers.getUploadById);

// GET uploads by staff ID
router.get('/staff/:sid', excelUploadControllers.getUploadsByStaffId);

// POST new upload log
router.post(
  '/',
  [
    check('uploaded_by').notEmpty(),
    check('filename').notEmpty(),
    check('valid_records').isInt({ min: 0 }),
    check('invalid_records').isInt({ min: 0 }),
  ],
  excelUploadControllers.createUpload
);

module.exports = router;
