const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initializeDatabase() {
  // First connect without database to create it
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  const db = connection.promise();

  try {
    console.log('🔧 Initializing database...');
    
    // Create database if it doesn't exist
    await db.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`✅ Database '${process.env.DB_NAME}' created/verified`);
    
    // Switch to the database
    await db.execute(`USE \`${process.env.DB_NAME}\``);
    
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
      )
    `;
    
    await db.execute(createUsersTable);
    console.log('✅ Users table created/verified');
    
    // Create sessions table for better session management
    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        session_token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_session_token (session_token)
      )
    `;
    
    await db.execute(createSessionsTable);
    console.log('✅ Sessions table created/verified');
    
    // Create admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tunegie.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Check if admin already exists
    const [existingAdmin] = await db.execute(
      'SELECT id FROM users WHERE email = ? OR role = "admin"',
      [adminEmail]
    );
    
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await db.execute(`
        INSERT INTO users (email, username, password, first_name, last_name, role, is_active) 
        VALUES (?, ?, ?, ?, ?, 'admin', true)
      `, [
        adminEmail,
        'admin',
        hashedPassword,
        'System',
        'Administrator'
      ]);
      
      console.log('✅ Admin user created successfully');
      console.log(`📧 Admin Email: ${adminEmail}`);
      console.log(`🔑 Admin Password: ${adminPassword}`);
    } else {
      console.log('ℹ️ Admin user already exists');
    }
    
    // Create some sample data tables that you might want to manage
    const createSampleDataTable = `
      CREATE TABLE IF NOT EXISTS app_data (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        data JSON,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON SET NULL,
        INDEX idx_category (category),
        INDEX idx_created_by (created_by)
      )
    `;
    
    await db.execute(createSampleDataTable);
    console.log('✅ App data table created/verified');
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

// Run initialization
initializeDatabase();
