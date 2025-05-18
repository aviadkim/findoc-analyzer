const axios = require('axios');

async function testChatApi() {
  try {
    console.log('Testing chat API endpoint...');
    
    // Test with doc-4 (Messos Portfolio)
    const response = await axios.post('http://localhost:8080/api/chat', {
      documentId: 'doc-4',
      message: 'What securities are in this portfolio?'
    });
    
    console.log('Response status:', response.status);
    console.log('Response source:', response.data.source);
    console.log('Response timestamp:', response.data.timestamp);
    console.log('Response message:\n', response.data.response);
    
    return 'Test completed successfully';
  } catch (error) {
    console.error('Error testing chat API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return 'Test failed';
  }
}

// Execute the test
testChatApi().then(result => {
  console.log('\nResult:', result);
});