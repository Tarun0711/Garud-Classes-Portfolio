const http = require('http');

// Test if backend server is running
function testBackendConnection() {
  console.log('🔍 Testing backend connection...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/emails',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Backend is running! Status: ${res.statusCode}`);
    console.log(`📍 URL: http://localhost:5000`);
    console.log(`🔗 Emails endpoint: http://localhost:5000/api/emails`);
    
    if (res.statusCode === 200) {
      console.log('🎉 Backend is accessible and responding!');
    } else {
      console.log(`⚠️  Backend responded with status: ${res.statusCode}`);
    }
  });

  req.on('error', (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Backend server is NOT running on port 5000');
      console.log('\n🚀 To start the backend server:');
      console.log('1. cd Backend');
      console.log('2. npm install (if not done already)');
      console.log('3. npm run dev');
      console.log('\n📝 Make sure you have a .env file with email configuration');
    } else {
      console.error('❌ Connection error:', error.message);
    }
  });

  req.on('timeout', () => {
    console.error('⏰ Connection timeout - backend might be slow to respond');
    req.destroy();
  });

  req.end();
}

// Test the connection
testBackendConnection();
