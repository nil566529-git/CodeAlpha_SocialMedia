const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  followUser,
  getUsers
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/users', protect, getUsers);
router.get('/profile/:id', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/follow/:id', protect, followUser);

module.exports = router;