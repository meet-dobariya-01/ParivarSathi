const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getOfficerStats,
  getDashboardSummary,
  getApplicationsByScheme,
  getApplicationsByStatus,
  getFamiliesByDistrict
} = require('../controllers/officerController');

// Existing stats endpoint (kept for backward compatibility)
router.get('/stats', protect, authorize('OFFICER'), getOfficerStats);

// New dashboard endpoints
router.get('/dashboard/summary', protect, authorize('OFFICER'), getDashboardSummary);
router.get('/dashboard/applications-by-scheme', protect, authorize('OFFICER'), getApplicationsByScheme);
router.get('/dashboard/applications-by-status', protect, authorize('OFFICER'), getApplicationsByStatus);
router.get('/dashboard/families-by-district', protect, authorize('OFFICER'), getFamiliesByDistrict);

module.exports = router;
