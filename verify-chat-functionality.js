/**
 * Verify Chat Functionality - HTTP Based
 * 
 * This script tests that the document-chat page has the textarea[name="message"] element
 * and that the sendQuestion function utilizes it properly.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Function to make an HTTP request
function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
      
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Analyze JS files in the HTML to check implementation
function analyzeHtml(html) {
  const results = {
    hasTextareaElement: false,
    nameAttributeValue: null,
    hasMessageTextareaReference: false,
    syncsBothInputs: false,
    clearsMessageTextarea: false,
    issues: []
  };
  
  // Check for textarea with name="message"
  const textareaRegex = /<textarea[^>]*name=["']([^"']+)["'][^>]*>/i;
  const textareaMatch = html.match(textareaRegex);
  
  if (textareaMatch) {
    results.hasTextareaElement = true;
    results.nameAttributeValue = textareaMatch[1];
    
    if (textareaMatch[1] !== 'message') {
      results.issues.push(`Textarea has name="${textareaMatch[1]}" instead of name="message"`);
    }
  } else {
    results.issues.push('No textarea with name attribute found');
  }
  
  // Check for references to messageTextarea in JS
  if (html.includes('messageTextarea')) {
    results.hasMessageTextareaReference = true;
    
    // Check for syncing inputs
    if (html.includes('messageTextarea.value = ') && 
        html.includes('questionInput.value = ')) {
      results.syncsBothInputs = true;
    } else {
      results.issues.push('Code doesn\'t sync values between inputs');
    }
    
    // Check for clearing both inputs
    if (html.includes('messageTextarea.value = \'\'')) {
      results.clearsMessageTextarea = true;
    } else {
      results.issues.push('Code doesn\'t clear messageTextarea after sending');
    }
  } else {
    results.issues.push('No references to messageTextarea in JavaScript');
  }
  
  return results;
}

// Main test function
async function verifyChat() {
  console.log('Verifying document chat functionality...\n');
  
  try {
    // Fetch the document-chat page
    console.log('Fetching document-chat page...');
    const response = await fetch('http://localhost:8080/document-chat');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch page: Status ${response.status}`);
    }
    
    console.log(`Successfully fetched page (${response.body.length} bytes)\n`);
    
    // Analyze the HTML
    console.log('Analyzing page...');
    const analysis = analyzeHtml(response.body);
    
    // Print results
    console.log('\nResults:');
    console.log('========');
    console.log(`1. Has textarea element: ${analysis.hasTextareaElement ? '✅ YES' : '❌ NO'}`);
    if (analysis.hasTextareaElement) {
      console.log(`   - Name attribute value: ${analysis.nameAttributeValue}`);
    }
    
    console.log(`2. References messageTextarea in JS: ${analysis.hasMessageTextareaReference ? '✅ YES' : '❌ NO'}`);
    console.log(`3. Syncs both inputs: ${analysis.syncsBothInputs ? '✅ YES' : '❌ NO'}`);
    console.log(`4. Clears messageTextarea after sending: ${analysis.clearsMessageTextarea ? '✅ YES' : '❌ NO'}`);
    
    // Show issues if any
    if (analysis.issues.length > 0) {
      console.log('\nIssues found:');
      analysis.issues.forEach((issue, i) => {
        console.log(`${i+1}. ${issue}`);
      });
    } else {
      console.log('\n✅ No issues found! The fix appears to be working correctly.');
    }
    
    // Extract and show the sendQuestion function
    console.log('\nChecking sendQuestion function implementation:');
    const sendQuestionRegex = /async\s+function\s+sendQuestion\s*\(\)\s*\{[\s\S]*?messageTextarea[\s\S]*?\}/;
    const functionMatch = response.body.match(sendQuestionRegex);
    
    if (functionMatch) {
      const snippet = functionMatch[0].split('\n').slice(0, 20).join('\n');
      console.log('First 20 lines of sendQuestion function:');
      console.log(snippet);
      console.log('...');
      
      // Check for specific implementation details
      const checks = [
        { name: "Gets messageTextarea element", regex: /messageTextarea\s*=\s*document\.getElementById\(['"]message['"]\)/, result: false },
        { name: "Prioritizes textarea input", regex: /if\s*\(\s*messageTextarea\s*&&\s*messageTextarea\.value\.trim\(\)\s*\)/, result: false },
        { name: "Syncs from textarea to input", regex: /questionInput\.value\s*=\s*question/, result: false },
        { name: "Syncs from input to textarea", regex: /messageTextarea\.value\s*=\s*question/, result: false },
        { name: "Disables textarea during processing", regex: /messageTextarea\.disabled\s*=\s*true/, result: false },
        { name: "Re-enables textarea after processing", regex: /messageTextarea\.disabled\s*=\s*false/, result: false },
        { name: "Clears textarea after sending", regex: /messageTextarea\.value\s*=\s*['"]?['"]?/, result: false },
      ];
      
      for (const check of checks) {
        check.result = check.regex.test(response.body);
      }
      
      console.log('\nImplementation checks:');
      checks.forEach(check => {
        console.log(`- ${check.name}: ${check.result ? '✅ YES' : '❌ NO'}`);
      });
      
      const passedChecks = checks.filter(c => c.result).length;
      console.log(`\n${passedChecks} of ${checks.length} implementation checks passed.`);
      
      if (passedChecks === checks.length) {
        console.log('\n✅ All implementation checks passed! Your fix should work with Puppeteer tests.');
      } else {
        console.log('\n⚠️ Some implementation details might be missing. The fix may not work completely.');
      }
      
    } else {
      console.log('❌ Could not find sendQuestion function implementation with messageTextarea references.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the verification
verifyChat();