const { GoogleGenerativeAI } = require('@google/generative-ai');

// API key from environment or hardcoded for testing
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDhbGC0_7BEbGRVBujzDPZC9TYWjBJCIf4';

// Check if the API key is valid
if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
  console.error('Please provide a valid Gemini API key');
  process.exit(1);
}

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(apiKey);

async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API with key:', apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5));

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Generate content
    const result = await model.generateContent('Hello, world! Please respond with a short greeting.');
    const response = await result.response;
    const text = response.text();

    console.log('Gemini API test successful!');
    console.log('Response:', text);
    return true;
  } catch (error) {
    console.error('Gemini API test failed:', error.message);
    return false;
  }
}

// Run the test
testGeminiAPI().then(success => {
  console.log('Test completed with status:', success ? 'SUCCESS' : 'FAILURE');
  if (!success) {
    console.log('Please update your Gemini API key.');
  }
});
