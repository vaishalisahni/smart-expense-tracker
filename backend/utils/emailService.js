const nodemailer = require('nodemailer');

// ✅ Check if email credentials are configured
const isEmailConfigured = () => {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
};

if (!isEmailConfigured()) {
  console.warn('⚠️ WARNING: Email credentials not configured. Email features will be disabled.');
  console.warn('Set EMAIL_USER and EMAIL_PASSWORD in .env to enable emails.');
}

// Create transporter only if configured
let transporter = null;
if (isEmailConfigured()) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

// ✅ Send OTP Email with validation
exports.sendOTPEmail = async (email, name, otp) => {
  if (!isEmailConfigured()) {
    console.log('📧 [DEV MODE] OTP Email would be sent to:', email);
    console.log('📧 [DEV MODE] OTP Code:', otp);
    return; // Don't throw error in development
  }

  const mailOptions = {
    from: `"Smart Expense Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for Registration - Smart Expense Tracker',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Smart Expense Tracker</h1>
            <p>AI-Powered Student Finance Manager</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for registering with Smart Expense Tracker. To complete your registration, please use the following OTP:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <p style="margin-top: 10px; color: #666;">This OTP is valid for 10 minutes</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              • Never share this OTP with anyone<br>
              • Our team will never ask for your OTP<br>
              • This OTP expires in 10 minutes<br>
              • You have 3 attempts to enter the correct OTP
            </div>
            
            <p>If you didn't request this OTP, please ignore this email or contact our support team.</p>
            
            <p>Best regards,<br>Smart Expense Tracker Team</p>
          </div>
          <div class="footer">
            <p>© 2025 Smart Expense Tracker. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send OTP email. Please try again later.');
  }
};

/**
 * Send Login OTP Email
 */
exports.sendLoginOTPEmail = async (email, name, otp) => {
  if (!isEmailConfigured()) {
    console.log('📧 [DEV MODE] Login OTP Email would be sent to:', email);
    console.log('📧 [DEV MODE] Login OTP Code:', otp);
    return; // Don't throw error in development
  }

  const mailOptions = {
    from: `"Smart Expense Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Login OTP - Smart Expense Tracker',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
          .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 12px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Login Request</h1>
            <p>Passwordless Authentication</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>We received a login request for your account. Use the following OTP to complete your login:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <p style="margin-top: 10px; color: #666;">This OTP is valid for 10 minutes</p>
            </div>
            
            <div class="info-box">
              <strong>🚀 Quick Login:</strong><br>
              • Enter the OTP on the login page<br>
              • No password needed<br>
              • Secure and fast authentication
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              • Never share this OTP with anyone<br>
              • Our team will never ask for your OTP<br>
              • This OTP expires in 10 minutes<br>
              • You have 3 attempts to enter the correct OTP
            </div>
            
            <p>If you didn't request this login, please ignore this email and consider changing your password.</p>
            
            <p>Best regards,<br>Smart Expense Tracker Team</p>
          </div>
          <div class="footer">
            <p>© 2025 Smart Expense Tracker. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Login OTP email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Error sending login OTP email:', error);
    throw new Error('Failed to send login OTP email. Please try again later.');
  }
};

// ✅ Send Budget Alert Email with validation
exports.sendBudgetAlert = async (email, name, alertData) => {
  if (!isEmailConfigured()) {
    console.log('📧 [DEV MODE] Budget Alert would be sent to:', email);
    console.log('📧 [DEV MODE] Alert Data:', alertData);
    return;
  }

  const { percentage, budgetUsed, totalBudget, level } = alertData;
  
  const alertColors = {
    warning: { bg: '#fef3c7', border: '#f59e0b', emoji: '⚠️' },
    danger: { bg: '#fee2e2', border: '#ef4444', emoji: '🚨' },
    critical: { bg: '#fecaca', border: '#dc2626', emoji: '❗' }
  };
  
  const color = alertColors[level] || alertColors.warning;

  const mailOptions = {
    from: `"Smart Expense Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${color.emoji} Budget Alert: ${percentage}% Used`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .alert-box { background: ${color.bg}; border-left: 4px solid ${color.border}; padding: 20px; border-radius: 8px; }
          .stats { background: white; padding: 15px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="alert-box">
            <h2>${color.emoji} Budget Alert!</h2>
            <p>Hi ${name},</p>
            <p>You've used <strong>${percentage}%</strong> of your monthly budget.</p>
          </div>
          <div class="stats">
            <p><strong>Budget Used:</strong> ₹${budgetUsed}</p>
            <p><strong>Total Budget:</strong> ₹${totalBudget}</p>
            <p><strong>Remaining:</strong> ₹${totalBudget - budgetUsed}</p>
          </div>
          <p>Consider reviewing your expenses to stay within budget.</p>
          <p>Best regards,<br>Smart Expense Tracker Team</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Budget alert sent to:', email);
  } catch (error) {
    console.error('❌ Error sending budget alert:', error);
    // Don't throw - budget alerts shouldn't break the app
  }
};

// ✅ Send Monthly Report Email with validation
exports.sendMonthlyReport = async (email, name, reportData) => {
  if (!isEmailConfigured()) {
    console.log('📧 [DEV MODE] Monthly Report would be sent to:', email);
    console.log('📧 [DEV MODE] Report Data:', reportData);
    return;
  }

  const { totalSpent, budget, topCategories, insights } = reportData;

  const mailOptions = {
    from: `"Smart Expense Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '📊 Your Monthly Expense Report',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .report-box { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .category-item { background: white; padding: 10px; margin: 10px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>📊 Monthly Expense Report</h2>
          <p>Hi ${name},</p>
          <div class="report-box">
            <h3>Summary</h3>
            <p><strong>Total Spent:</strong> ₹${totalSpent}</p>
            <p><strong>Budget:</strong> ₹${budget}</p>
            <p><strong>Remaining:</strong> ₹${budget - totalSpent}</p>
          </div>
          <h3>Top Spending Categories:</h3>
          ${topCategories.map(cat => `
            <div class="category-item">
              <strong>${cat.name}:</strong> ₹${cat.amount}
            </div>
          `).join('')}
          <h3>AI Insights:</h3>
          <ul>
            ${insights.map(insight => `<li>${insight}</li>`).join('')}
          </ul>
          <p>Best regards,<br>Smart Expense Tracker Team</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Monthly report sent to:', email);
  } catch (error) {
    console.error('❌ Error sending monthly report:', error);
  }
};

// Export configuration status
exports.isEmailConfigured = isEmailConfigured;