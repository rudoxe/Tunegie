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

  async sendPasswordResetEmail(email, username, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@tunegie.com',
      to: email,
      subject: 'Password Reset - Tunegie',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Tunegie - Password Reset</h2>
          <p>Hello ${username},</p>
          <p>You requested a password reset for your Tunegie account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px;">Best regards,<br>The Tunegie Team</p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      
      // For development, log the preview URL
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Password reset email sent!');
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      
      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      };
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return {
        success: false,
        error: error.message
      };
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