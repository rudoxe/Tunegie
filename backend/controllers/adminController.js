const { db } = require('../config/database');

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = `
      SELECT id, email, username, first_name, last_name, role, is_active, 
             created_at, updated_at, last_login
      FROM users
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    let params = [];
    let countParams = [];

    if (search) {
      const searchCondition = ` WHERE (email LIKE ? OR username LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
      query += searchCondition;
      countQuery += searchCondition;
      
      const searchParam = `%${search}%`;
      params = [searchParam, searchParam, searchParam, searchParam];
      countParams = [searchParam, searchParam, searchParam, searchParam];
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [users] = await db.execute(query, params);
    const [totalCount] = await db.execute(countQuery, countParams);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: totalCount[0].total,
          pages: Math.ceil(totalCount[0].total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const [users] = await db.execute(`
      SELECT id, email, username, first_name, last_name, role, is_active, 
             created_at, updated_at, last_login
      FROM users 
      WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user: users[0] }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, username, firstName, lastName, role, isActive } = req.body;

    // Check if user exists
    const [existingUser] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email/username is already taken by another user
    const [duplicateUser] = await db.execute(`
      SELECT id FROM users 
      WHERE (email = ? OR username = ?) AND id != ?
    `, [email, username, userId]);

    if (duplicateUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email or username already taken by another user'
      });
    }

    // Update user
    await db.execute(`
      UPDATE users 
      SET email = ?, username = ?, first_name = ?, last_name = ?, role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [email, username, firstName, lastName, role, isActive, userId]);

    res.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get user statistics
    const [userStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_users,
        COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_users,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as users_today,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as users_this_week,
        COUNT(CASE WHEN DATE(last_login) = CURDATE() THEN 1 END) as logins_today
      FROM users
    `);

    // Get app data statistics
    const [appDataStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT category) as total_categories,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as records_today
      FROM app_data
    `);

    // Get recent users
    const [recentUsers] = await db.execute(`
      SELECT id, email, username, first_name, last_name, role, created_at
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    // Get recent app data
    const [recentAppData] = await db.execute(`
      SELECT id, name, category, created_at
      FROM app_data 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        userStats: userStats[0],
        appDataStats: appDataStats[0],
        recentUsers,
        recentAppData
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all app data
const getAllAppData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category || '';
    const search = req.query.search || '';

    let query = `
      SELECT ad.*, u.username as created_by_username 
      FROM app_data ad
      LEFT JOIN users u ON ad.created_by = u.id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM app_data';
    let params = [];
    let countParams = [];
    let conditions = [];

    if (category) {
      conditions.push('ad.category = ?');
      params.push(category);
      countParams.push(category);
    }

    if (search) {
      conditions.push('(ad.name LIKE ? OR ad.description LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
      countParams.push(searchParam, searchParam);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause.replace('ad.', '');
    }

    query += ' ORDER BY ad.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [appData] = await db.execute(query, params);
    const [totalCount] = await db.execute(countQuery, countParams);

    res.json({
      success: true,
      data: {
        appData,
        pagination: {
          page,
          limit,
          total: totalCount[0].total,
          pages: Math.ceil(totalCount[0].total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get app data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch app data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all database tables and their structure
const getDatabaseSchema = async (req, res) => {
  try {
    // Get all tables
    const [tables] = await db.execute(`
      SELECT TABLE_NAME as table_name, TABLE_ROWS as row_count, TABLE_COMMENT as comment
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [process.env.DB_NAME]);

    const schema = {};

    // Get columns for each table
    for (const table of tables) {
      const [columns] = await db.execute(`
        SELECT COLUMN_NAME as column_name, DATA_TYPE as data_type, 
               IS_NULLABLE as nullable, COLUMN_DEFAULT as default_value,
               COLUMN_KEY as key_type, COLUMN_COMMENT as comment
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [process.env.DB_NAME, table.table_name]);

      schema[table.table_name] = {
        row_count: table.row_count,
        comment: table.comment,
        columns: columns
      };
    }

    res.json({
      success: true,
      data: { schema }
    });

  } catch (error) {
    console.error('Get database schema error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch database schema',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
  getAllAppData,
  getDatabaseSchema
};
