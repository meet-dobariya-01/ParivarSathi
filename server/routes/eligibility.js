const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { findSchemesForMyFamily, evaluateScheme } = require('../controllers/eligibilityController');

// Find all schemes for current citizen's family
router.get('/my-family', protect, findSchemesForMyFamily);

// Evaluate specific scheme for a specific family
router.get('/family/:familyId/scheme/:schemeId', protect, evaluateScheme);

module.exports = router;
