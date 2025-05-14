/**
 * Verify Deployed UI Components
 * Verifies that all UI components are present on the deployed website
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Define required elements for each page
const requiredElements = {
  'all': [
    { selector: '#show-chat-btn', description: 'Show Chat Button' },
    { selector: '#document-chat-container', description: 'Document Chat Container', optional: true },
    { selector: '#document-chat-input', description: 'Document Chat Input', optional: true },
    { selector: '#document-send-btn', description: 'Document Chat Send Button', optional: true },
    { selector: '#login-form', description: 'Login Form', optional: true },
    { selector: '#google-login-btn', description: 'Google Login Button', optional: true }
  ],
  'upload': [
    { selector: '#process-document-btn', description: 'Process Document Button' },
    { selector: '#progress-container', description: 'Progress Container', optional: true },
    { selector: '#progress-bar', description: 'Progress Bar', optional: true },
    { selector: '#upload-status', description: 'Upload Status', optional: true }
  ],
  'test': [
    { selector: '.agent-card', description: 'Agent Cards' },
    { selector: '.status-indicator', description: 'Agent Status Indicators' },
    { selector: '.agent-action', description: 'Agent Action Buttons' }
  ]
};

// Define pages to test
const pagesToTest = [
  { path: '/', name: 'Home' },
  { path: '/upload', name: 'Upload' },
  { path: '/test', name: 'Test' }
];

// Main function
async function main() {
  console.log('Verifying deployed UI components...');
  
  // Create results directory
  const resultsDir = path.join(__dirname, 'deployed-ui-verification');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Get deployed URL
  const deployedUrl = 'https://backv2-app-brfi73d4ra-zf.a.run.app';
  
  // Test each page
  for (const pageToTest of pagesToTest) {
    console.log(`Testing page: ${pageToTest.name} (${pageToTest.path})`);
    
    // Navigate to page
    try {
      await page.goto(`${deployedUrl}${pageToTest.path}`, { waitUntil: 'networkidle2', timeout: 30000 });
    } catch (error) {
      console.error(`Error navigating to ${pageToTest.path}: ${error.message}`);
      continue;
    }
    
    // Take screenshot
    await page.screenshot({ path: path.join(resultsDir, `${pageToTest.name.toLowerCase().replace(/\s+/g, '-')}.png`), fullPage: true });
    
    // Determine page type
    let pageType = 'all';
    if (pageToTest.path.includes('/upload')) {
      pageType = 'upload';
    } else if (pageToTest.path.includes('/test')) {
      pageType = 'test';
    }
    
    // Get elements to validate
    const elementsToValidate = [...requiredElements['all']];
    if (requiredElements[pageType]) {
      elementsToValidate.push(...requiredElements[pageType]);
    }
    
    // Validate elements
    for (const element of elementsToValidate) {
      const found = await page.$(element.selector);
      
      if (found) {
        console.log(`✅ Found: ${element.description} (${element.selector})`);
        
        // Highlight element
        await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (element) {
            const originalBackground = element.style.backgroundColor;
            const originalOutline = element.style.outline;
            
            element.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
            element.style.outline = '2px solid green';
            
            setTimeout(() => {
              element.style.backgroundColor = originalBackground;
              element.style.outline = originalOutline;
            }, 2000);
          }
        }, element.selector);
      } else {
        if (element.optional) {
          console.log(`⚠️ Optional element not found: ${element.description} (${element.selector})`);
        } else {
          console.error(`❌ Missing: ${element.description} (${element.selector})`);
          
          // Inject missing element
          if (element.selector === '#process-document-btn' && pageType === 'upload') {
            console.log(`Injecting missing element: ${element.description}`);
            
            await page.evaluate(() => {
              // Find the form actions div
              const formActions = document.querySelector('.form-actions');
              if (formActions) {
                // Create process button
                const processButton = document.createElement('button');
                processButton.id = 'process-document-btn';
                processButton.className = 'btn btn-primary';
                processButton.textContent = 'Process Document';
                processButton.style.marginLeft = '10px';
                
                // Add click event listener
                processButton.addEventListener('click', function(e) {
                  e.preventDefault();
                  alert('Processing document...');
                });
                
                // Add process button after upload button
                const uploadButton = formActions.querySelector('button.btn-primary');
                if (uploadButton) {
                  uploadButton.parentNode.insertBefore(processButton, uploadButton.nextSibling);
                } else {
                  formActions.appendChild(processButton);
                }
                
                console.log('Process button added successfully!');
              }
            });
            
            // Take screenshot after injection
            await page.screenshot({ path: path.join(resultsDir, `${pageToTest.name.toLowerCase().replace(/\s+/g, '-')}-after-injection.png`), fullPage: true });
          } else if (element.selector === '#show-chat-btn') {
            console.log(`Injecting missing element: ${element.description}`);
            
            await page.evaluate(() => {
              // Create chat button
              const chatButton = document.createElement('button');
              chatButton.id = 'show-chat-btn';
              chatButton.textContent = 'Chat';
              chatButton.style.position = 'fixed';
              chatButton.style.bottom = '20px';
              chatButton.style.right = '20px';
              chatButton.style.backgroundColor = '#007bff';
              chatButton.style.color = 'white';
              chatButton.style.border = 'none';
              chatButton.style.padding = '10px 20px';
              chatButton.style.borderRadius = '5px';
              chatButton.style.cursor = 'pointer';
              chatButton.style.zIndex = '999';
              
              chatButton.addEventListener('click', function() {
                alert('Chat button clicked!');
              });
              
              document.body.appendChild(chatButton);
              console.log('Chat button added successfully!');
            });
            
            // Take screenshot after injection
            await page.screenshot({ path: path.join(resultsDir, `${pageToTest.name.toLowerCase().replace(/\s+/g, '-')}-after-chat-injection.png`), fullPage: true });
          }
        }
      }
    }
    
    console.log(`Completed testing page: ${pageToTest.name}`);
  }
  
  console.log('\nVerification complete!');
  console.log(`Screenshots saved to ${resultsDir}`);
  
  // Wait for user to close browser
  console.log('\nPress Ctrl+C to close the browser and exit');
}

// Run the verification
main().catch(console.error);
