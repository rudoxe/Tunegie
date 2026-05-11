const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configure email transporter based on environment
    this.transporter = nodemailer.createTransporter({
      // For development, use a test account (Ethereal)
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true' || false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || '', // Your email or test email
        pass: process.env.EMAIL_PASS || ''  // Your email password or test password
      }
    });

    // For development, create test account if no email config is provided
    if (!process.env.EMAIL_USER) {
      this.createTestAccount();
    }
  }

  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      console.log('📧 Test email account created:');
      console.log('User:', testAccount.user);
      console.log('Pass:', testAccount.pass);
    } catch (error) {
      console.error('Failed to create test account:', error);
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();