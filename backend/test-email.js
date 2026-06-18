// backend/test-email.js
require('dotenv').config();
const { sendEmail } = require('./utils/mailer');

async function test() {
  console.log('Starting SMTP mail test...');
  try {
    const info = await sendEmail({
      to: process.env.SMTP_USER || 'vishnureddyadena7@gmail.com',
      subject: 'LibraryOS SMTP Test Connection',
      text: 'Nodemailer connection verified successfully!',
      html: '<h1>Success!</h1><p>Your LibraryOS Nodemailer integration works perfectly.</p>'
    });
    console.log('Mail sent successfully!', info);
  } catch (error) {
    console.error('SMTP Connection failed:', error);
  }
}

test();
