/**
 * Test Server
 * 
 * A simple script to test if the server is responding.
 */

const axios = require('axios');

const testServer = async () => {
  try {
    console.log('Testing server health endpoint...');
    
    const response = await axios.get('http://localhost:8080/api/health');
    
    console.log('Server response:', response.data);
    console.log('Server is running correctly!');
    
    return true;
  } catch (error) {
    console.error('Error testing server:', error.message);
    
    if (error.response) {
      console.error('Server response:', error.response.data);
    }
    
    return false;
  }
};

testServer().then(result => {
  if (!result) {
    process.exit(1);
  }
});
