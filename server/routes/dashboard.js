const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDashboardSummary,
  getApplicationsByScheme,
  getApplicationsByStatus,
  getFamiliesByDistrict
} = require('../controllers/officerController');

// Dashboard endpoints (OFFICER only)
router.get('/summary', protect, authorize('OFFICER'), getDashboardSummary);
router.get('/applications-by-scheme', protect, authorize('OFFICER'), getApplicationsByScheme);
router.get('/applications-by-status', protect, authorize('OFFICER'), getApplicationsByStatus);
router.get('/families-by-district', protect, authorize('OFFICER'), getFamiliesByDistrict);

module.exports = router;
