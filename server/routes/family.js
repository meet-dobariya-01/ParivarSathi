const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getMyFamily,
  createFamily,
  addMember,
  updateFamily,
  deactivateMember,
  getAllFamilies
} = require('../controllers/familyController');

// Citizen routes
router.get('/my', protect, getMyFamily);
router.post('/create', protect, createFamily);
router.post('/member', protect, addMember);
router.put('/update', protect, updateFamily);
router.delete('/member/:membershipId', protect, deactivateMember);

// Officer routes
router.get('/all', protect, authorize('OFFICER'), getAllFamilies);

module.exports = router;
