const axios = require('axios');

// Test enrollment data
const testEnrollmentData = {
  fullName: "Test Student",
  dateOfBirth: "2005-06-15",
  gender: "male",
  email: "teststudent@example.com",
  mobileNumber: "9876543210",
  alternateContact: "9876543211",
  street: "123 Test Street",
  city: "Test City",
  state: "Test State",
  pincode: "123456",
  currentClass: "11th",
  targetExam: "jee-main",
  schoolCollege: "Test School",
  preferredBatch: "evening",
  sourceOfInformation: "website",
  message: "I want to join JEE Main preparation course."
};

// Test the enrollment endpoint
async function testEnrollment() {
  try {
    console.log('Testing enrollment endpoint...');
    console.log('Sending data:', JSON.stringify(testEnrollmentData, null, 2));
    
    const response = await axios.post('https://garud-classes-portfolio.onrender.com/api/emails/enrollment', testEnrollmentData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

// Run the test
testEnrollment();
