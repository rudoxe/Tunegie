const { db } = require('../config/database');

async function addPasswordResetTables() {
  try {
    console.log('🔧 Adding password reset and username history tables...');

    // Add password reset tokens table
    const createPasswordResetTable = `
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
      )
    `;

    await db.execute(createPasswordResetTable);
    console.log('✅ Password reset tokens table created/verified');

    // Add username history table
    const createUsernameHistoryTable = `
      CREATE TABLE IF NOT EXISTS username_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        old_username VARCHAR(100) NOT NULL,
        new_username VARCHAR(100) NOT NULL,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_changed_at (changed_at)
      )
    `;

    await db.execute(createUsernameHistoryTable);
    console.log('✅ Username history table created/verified');

    console.log('🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  addPasswordResetTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = addPasswordResetTables;