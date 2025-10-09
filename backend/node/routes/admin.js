const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
  getAllAppData,
  getDatabaseSchema
} = require('../controllers/adminController');

const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateUpdateUser } = require('../validators/authValidator');

// All admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', validateUpdateUser, updateUser);
router.delete('/users/:id', deleteUser);

// App data management
router.get('/app-data', getAllAppData);

// Database schema
router.get('/database/schema', getDatabaseSchema);

module.exports = router;
