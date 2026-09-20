const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createScheme,
  getSchemes,
  updateScheme,
  toggleSchemeStatus,
  addRuleToScheme,
  deleteRule
} = require('../controllers/schemeController');

router.get('/', protect, getSchemes);

// Officer endpoints
router.post('/', protect, authorize('OFFICER'), createScheme);
router.put('/:id', protect, authorize('OFFICER'), updateScheme);
router.patch('/:id/toggle', protect, authorize('OFFICER'), toggleSchemeStatus);
router.post('/:id/rules', protect, authorize('OFFICER'), addRuleToScheme);
router.delete('/rules/:ruleId', protect, authorize('OFFICER'), deleteRule);

module.exports = router;
