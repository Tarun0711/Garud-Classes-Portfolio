require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Testing Email Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST || 'NOT SET'}`);
console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT || 'NOT SET'}`);
console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || 'NOT SET'}`);
console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS || 'NOT SET'}`);

// Validate required fields
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ Missing required email credentials!');
  console.log('\n📝 Please create a .env file with:');
  console.log('EMAIL_USER=your-gmail@gmail.com');
  console.log('EMAIL_PASS=your-app-password');
  console.log('EMAIL_FROM=Garud Classes <your-gmail@gmail.com>');
  process.exit(1);
}

// Test email connection
async function testEmailConnection() {
  try {
    console.log('🔐 Testing Gmail connection...');
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ Gmail connection successful!');
    
    // Test sending a simple email
    console.log('\n📧 Testing email sending...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, 
      subject: 'Test Email - Garud Classes',
      html: `
        <h2>🎉 Email Configuration Test Successful!</h2>
        <p>Your Gmail setup is working correctly.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`📨 Message ID: ${info.messageId}`);
    console.log('\n🎯 Your email configuration is ready for the enrollment system!');
    
  } catch (error) {
    console.error('\n❌ Email test failed:');
     
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed!');
      console.log('\n📋 Common solutions:');
      console.log('1. Make sure 2-Factor Authentication is enabled on your Gmail');
      console.log('2. Generate an App Password (not your regular password)');
      console.log('3. Use the App Password in EMAIL_PASS');
      console.log('4. Check that EMAIL_USER is your full Gmail address');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Connection failed!');
      console.log('Check your internet connection and firewall settings.');
    } else {
      console.error('Error details:', error.message);
    }
    
    console.log('\n📖 For detailed setup instructions, see:');
    console.log('https://support.google.com/accounts/answer/185833');
  }
}

// Run the test
testEmailConnection();
