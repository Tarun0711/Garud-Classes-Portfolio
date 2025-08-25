const emailService = require('./config/email').emailService;

async function testContactEmail() {
  try {
    console.log('🧪 Testing contact email functionality...');
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      course: 'JEE Main + Advanced',
      message: 'This is a test message from the contact form.',
      preferredTime: 'Morning (9 AM - 12 PM)'
    };

    // Create test email HTML
    const contactEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">📞 TEST - New Contact Form Submission</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Garud Classes - Contact Inquiry</p>
          </div>
          
          <div style="background-color: #3498db; color: white; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="margin: 0; font-size: 20px;">📋 Inquiry Details</h2>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div>
              <h3 style="color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 8px; margin-bottom: 15px;">👤 Contact Information</h3>
              <p><strong>Full Name:</strong> ${testData.name}</p>
              <p><strong>Email:</strong> ${testData.email}</p>
              <p><strong>Phone:</strong> ${testData.phone}</p>
            </div>
            
            <div>
              <h3 style="color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 8px; margin-bottom: 15px;">🎯 Course Interest</h3>
              <p><strong>Course:</strong> ${testData.course}</p>
              <p><strong>Preferred Time:</strong> ${testData.preferredTime}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 8px; margin-bottom: 15px;">💬 Message</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">
              <p style="margin: 0; color: #2c3e50; line-height: 1.6;">${testData.message}</p>
            </div>
          </div>
          
          <div style="background-color: #e8f5e8; border-left: 4px solid #27ae60; padding: 15px; border-radius: 5px; margin-bottom: 25px;">
            <p style="margin: 0; color: #2c3e50;"><strong>📅 Submission Date:</strong> ${new Date().toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
              This is a TEST email from the Garud Classes contact form.<br>
              Please respond to the inquiry at: <strong>${testData.email}</strong> or call: <strong>${testData.phone}</strong>
            </p>
          </div>
        </div>
      </div>
    `;

    // Send test email
    const result = await emailService.sendCustomEmail(
      'tarunchoudhary0711@gmail.com',
      'TEST - New Contact Form Inquiry - Test User',
      contactEmailHtml
    );

    if (result.success) {
      console.log('✅ Contact email test successful!');
      console.log(`📧 Email sent with message ID: ${result.messageId}`);
      console.log(`📬 Sent to: tarunchoudhary0711@gmail.com`);
    } else {
      console.log('❌ Contact email test failed!');
      console.log(`Error: ${result.error}`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testContactEmail();

