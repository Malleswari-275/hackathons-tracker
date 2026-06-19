const nodemailer = require('nodemailer');
const env = require('./env');

let transporter;

if (env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
} else {
  // Ethereal / Sandbox test mode
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'mock.user@ethereal.email',
      pass: 'mockpassword'
    }
  });
  console.log('Mailer initialized in sandbox/Ethereal mock mode.');
}

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      text,
      html
    });
    console.log(`Email sent: ${info.messageId}`);
    // If Ethereal, log preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Email Preview URL: ${previewUrl}`);
    }
    return info;
  } catch (error) {
    console.error(`Email Sending Failed: ${error.message}`);
    // Do not throw in production to prevent user flows from crashing because of email provider down
    return null;
  }
};

module.exports = {
  transporter,
  sendEmail
};
