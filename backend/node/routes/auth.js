const express = require('express');
const router = express.Router();

const { register, login, getProfile, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../validators/authValidator');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

module.exports = router;
