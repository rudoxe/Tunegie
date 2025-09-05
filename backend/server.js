const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Add your production domain
    : ['http://localhost:3000', 'http://127.0.0.1:3000'], // React dev server
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Tunegie API Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Tunegie API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get user profile (requires auth)',
        'POST /api/auth/logout': 'Logout user (requires auth)'
      },
      admin: {
        'GET /api/admin/dashboard/stats': 'Get dashboard statistics (admin only)',
        'GET /api/admin/users': 'Get all users with pagination (admin only)',
        'GET /api/admin/users/:id': 'Get user by ID (admin only)',
        'PUT /api/admin/users/:id': 'Update user (admin only)',
        'DELETE /api/admin/users/:id': 'Delete user (admin only)',
        'GET /api/admin/app-data': 'Get all app data (admin only)',
        'GET /api/admin/database/schema': 'Get database schema (admin only)'
      },
      general: {
        'GET /api/health': 'Health check',
        'GET /api/docs': 'This documentation'
      }
    }
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? {
      stack: error.stack,
      details: error
    } : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your Laragon MySQL service.');
      console.log('💡 Make sure Laragon is running and MySQL service is started.');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log('🚀 Tunegie API Server Started Successfully');
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📖 API docs: http://localhost:${PORT}/api/docs`);
      console.log(`🛡️ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('');
      console.log('Available endpoints:');
      console.log('- POST /api/auth/register - Register new user');
      console.log('- POST /api/auth/login - Login user');
      console.log('- GET /api/auth/profile - Get user profile');
      console.log('- GET /api/admin/dashboard/stats - Admin dashboard');
      console.log('- GET /api/admin/users - Manage users');
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
