const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', upload.single('profilePhoto'), register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('profilePhoto'), updateProfile);

module.exports = router;
