const nodemailer = require('nodemailer');

/**
 * Sends an email using SMTP transport settings from environment variables.
 * Falls back to simulation if credentials are not configured.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const isMock = !user || !pass || pass.includes('YOUR_GMAIL_APP_PASSWORD') || pass.trim() === '';

  if (isMock) {
    console.warn(`[SMTP MOCK] Simulated sending email to ${to}: ${subject}`);
    return { success: true, simulated: true, otp: text.match(/\b\d{6}\b/)?.[0] };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for port 465, false for 587
    auth: {
      user,
      pass
    },
    connectionTimeout: 8000,
    socketTimeout: 8000
  });

  const mailOptions = {
    from: `"LibraryOS Verification" <${user}>`,
    to,
    subject,
    text,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, simulated: false, info };
};

module.exports = { sendEmail };
