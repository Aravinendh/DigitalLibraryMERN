const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public test route
router.get('/public', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Public test route is working'
  });
});

// Protected test route (any authenticated user)
router.get('/protected', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Protected test route is working',
    user: req.user
  });
});

// Admin test route
router.get('/admin', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin test route is working',
    user: req.user
  });
});

module.exports = router;
