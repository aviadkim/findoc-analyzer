/**
 * Test Chat Compatibility - Simple Version
 * 
 * This script doesn't use Puppeteer and just checks if the document-chat-fix.js
 * adds the textarea[name="message"] element for test compatibility
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Function to make an HTTP request and return the response body
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
      
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Check if the HTML contains the textarea with name="message"
function checkHtmlForTextarea(html) {
  const regex = /<textarea[^>]*name=['"]message['"][^>]*>/i;
  return regex.test(html);
}

// Main test function
async function runTest() {
  console.log('Starting simple chat compatibility test...');
  
  try {
    // First check if document-chat-fix.js adds the compatibility code
    const jsFilePath = path.join(__dirname, 'public', 'js', 'document-chat-fix.js');
    if (fs.existsSync(jsFilePath)) {
      const jsContent = fs.readFileSync(jsFilePath, 'utf8');
      
      // Check if the file contains code to add textarea[name="message"]
      const containsTextareaName = jsContent.includes('textarea') && 
                                   jsContent.includes('name') && 
                                   jsContent.includes('message');
      
      console.log(`JS file check: ${containsTextareaName ? 'PASS' : 'FAIL'} - The fix file ${containsTextareaName ? 'contains' : 'does not contain'} code to add textarea[name="message"]`);
      
      if (!containsTextareaName) {
        console.error('The document-chat-fix.js file does not seem to add a textarea with name="message".');
        console.error('Please update the file to include this compatibility code.');
      }
    } else {
      console.error(`Error: Could not find the JS file at ${jsFilePath}`);
    }
    
    // Try to access the website and check the HTML
    console.log('\nChecking live website...');
    try {
      const html = await fetchPage('http://localhost:8080/document-chat');
      const hasTextarea = checkHtmlForTextarea(html);
      
      console.log(`Live website check: ${hasTextarea ? 'PASS' : 'FAIL'} - The page ${hasTextarea ? 'contains' : 'does not contain'} textarea[name="message"]`);
      
      if (!hasTextarea) {
        console.error('The document-chat page does not contain a textarea with name="message".');
        console.error('Possible reasons:');
        console.error('1. The server is not serving the latest document-chat-fix.js file');
        console.error('2. The document-chat-fix.js is not being loaded on the page');
        console.error('3. The JS code in document-chat-fix.js is not working as expected');
        
        // Check if any textarea exists
        const textareaRegex = /<textarea[^>]*>/i;
        const hasAnyTextarea = textareaRegex.test(html);
        console.log(`  Note: The page ${hasAnyTextarea ? 'does contain some textarea elements' : 'does not contain any textarea elements'}`);
      }
    } catch (error) {
      console.error('Error fetching live website:', error.message);
    }
    
    // Recommendation based on the tests
    console.log('\nRecommendation:');
    console.log('1. Make sure the document-chat-fix.js file adds a textarea with name="message"');
    console.log('2. Ensure the JS file is included on the document-chat page');
    console.log('3. Verify that the JS code runs after the page is loaded');
    console.log('4. Check browser console for any errors');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
runTest();