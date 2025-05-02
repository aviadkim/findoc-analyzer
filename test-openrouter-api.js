// Import fetch correctly for Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// API key from environment or hardcoded for testing
const apiKey = process.env.OPENROUTER_API_KEY || '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';

async function testOpenRouterAPI() {
  try {
    console.log('Testing OpenRouter API with key:', apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5));

    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter API test successful!');
    console.log('Available models:', data.data.map(model => model.id).join(', '));
    return true;
  } catch (error) {
    console.error('OpenRouter API test failed:', error.message);
    return false;
  }
}

// Run the test
testOpenRouterAPI().then(success => {
  console.log('Test completed with status:', success ? 'SUCCESS' : 'FAILURE');
  if (!success) {
    console.log('Please update your OpenRouter API key.');
  }
});
