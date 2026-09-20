const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getOfficerStats } = require('../controllers/officerController');

router.get('/stats', protect, authorize('OFFICER'), getOfficerStats);

module.exports = router;
