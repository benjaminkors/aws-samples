// routes/s3Routes.js
const express = require('express');
const { uploadFile, uploadMiddleware } = require('../controllers/s3Controller');

const router = express.Router();

// Define the upload route
router.post('/upload', uploadMiddleware, uploadFile);

module.exports = router;
