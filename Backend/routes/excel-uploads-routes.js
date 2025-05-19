const express = require('express');
const { check } = require('express-validator');

const excelUploadControllers = require('../controllers/excel-uploads-controller');
const checkAuth = require('../middleware/check-auth');
const upload = require('../middleware/file-upload');

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
router.post('/', upload.single('file'), excelUploadControllers.createUpload);

module.exports = router;
