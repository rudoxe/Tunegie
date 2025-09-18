const express = require('express');
const router = express.Router();

const { register, login, getProfile, logout, requestPasswordReset, resetPassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin, validatePasswordReset, validateResetPassword } = require('../validators/authValidator');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validatePasswordReset, requestPasswordReset);
router.post('/reset-password', validateResetPassword, resetPassword);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

module.exports = router;
