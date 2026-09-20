const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  applyForScheme,
  getMyFamilyApplications,
  getAllApplications,
  reviewApplication
} = require('../controllers/applicationController');

// Citizen routes
router.post('/apply', protect, applyForScheme);
router.get('/my', protect, getMyFamilyApplications);

// Officer routes
router.get('/all', protect, authorize('OFFICER'), getAllApplications);
router.put('/:id/review', protect, authorize('OFFICER'), reviewApplication);

module.exports = router;
