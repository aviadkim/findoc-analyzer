const puppeteer = require('puppeteer');

async function testUIIssues() {
  console.log('Starting UI issues test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Test login page
    console.log('Testing login page...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app/login', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'test-screenshots/login-page.png' });
    
    // Test Google login button
    console.log('Testing Google login button...');
    const googleLoginButton = await page.$('#google-login-btn');
    if (googleLoginButton) {
      console.log('Google login button found');
      await googleLoginButton.click();
      await new Promise(resolve => setTimeout(resolve, 3000));
      await page.screenshot({ path: 'test-screenshots/google-login-clicked.png' });
      
      // Check for error messages
      const errorMessages = await page.evaluate(() => {
        const errors = Array.from(document.querySelectorAll('.error-message, #auth-error, .alert-danger'));
        return errors.map(error => error.textContent || error.innerText);
      });
      
      if (errorMessages.length > 0) {
        console.error('Error messages found:', errorMessages);
      }
    } else {
      console.error('Google login button not found');
    }
    
    // Test upload page
    console.log('Testing upload page...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app/upload', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'test-screenshots/upload-page.png' });
    
    // Test process button
    console.log('Testing process button...');
    const processButton = await page.$('#process-button');
    if (processButton) {
      console.log('Process button found');
      await processButton.click();
      await new Promise(resolve => setTimeout(resolve, 3000));
      await page.screenshot({ path: 'test-screenshots/process-button-clicked.png' });
    } else {
      console.error('Process button not found');
    }
    
    // Test document details page
    console.log('Testing document details page...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app/document-details.html?id=doc-1', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'test-screenshots/document-details-page.png' });
    
    // Test process document button
    console.log('Testing process document button...');
    const processDocumentButton = await page.$('#process-document-btn');
    if (processDocumentButton) {
      console.log('Process document button found');
      await processDocumentButton.click();
      await new Promise(resolve => setTimeout(resolve, 3000));
      await page.screenshot({ path: 'test-screenshots/process-document-button-clicked.png' });
    } else {
      console.error('Process document button not found');
    }
    
    // Test document chat page
    console.log('Testing document chat page...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app/document-chat', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'test-screenshots/document-chat-page.png' });
    
    // Test document selector
    console.log('Testing document selector...');
    const documentSelector = await page.$('#document-select');
    if (documentSelector) {
      console.log('Document selector found');
      await page.select('#document-select', 'doc-1');
      await new Promise(resolve => setTimeout(resolve, 3000));
      await page.screenshot({ path: 'test-screenshots/document-selected.png' });
      
      // Test document chat input
      console.log('Testing document chat input...');
      const documentChatInput = await page.$('#document-chat-input');
      if (documentChatInput) {
        console.log('Document chat input found');
        await documentChatInput.type('What is the total revenue?');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'test-screenshots/document-chat-input.png' });
        
        // Test document chat send button
        console.log('Testing document chat send button...');
        const documentChatSendButton = await page.$('#document-send-btn');
        if (documentChatSendButton) {
          console.log('Document chat send button found');
          await documentChatSendButton.click();
          await new Promise(resolve => setTimeout(resolve, 3000));
          await page.screenshot({ path: 'test-screenshots/document-chat-send.png' });
          
          // Check for chat messages
          const chatMessages = await page.$$('#document-chat-messages > div');
          console.log(`Found ${chatMessages.length} chat messages`);
        } else {
          console.error('Document chat send button not found');
        }
      } else {
        console.error('Document chat input not found');
      }
    } else {
      console.error('Document selector not found');
    }
    
    // Test test page
    console.log('Testing test page...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app/test', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'test-screenshots/test-page.png' });
    
    // Test agent cards
    console.log('Testing agent cards...');
    const agentCards = await page.$$('.agent-card');
    if (agentCards.length > 0) {
      console.log(`Found ${agentCards.length} agent cards`);
      
      // Test agent action buttons
      console.log('Testing agent action buttons...');
      const agentActionButtons = await page.$$('.agent-action');
      if (agentActionButtons.length > 0) {
        console.log(`Found ${agentActionButtons.length} agent action buttons`);
        
        // Click the first agent action button
        await agentActionButtons[0].click();
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'test-screenshots/agent-action-clicked.png' });
      } else {
        console.error('No agent action buttons found');
      }
    } else {
      console.error('No agent cards found');
    }
    
    console.log('UI issues test completed successfully');
  } catch (error) {
    console.error('Error testing UI issues:', error);
  } finally {
    await browser.close();
  }
}

testUIIssues();
