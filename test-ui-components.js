const puppeteer = require('puppeteer');

async function testUIComponents() {
  console.log('Starting UI components test...');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // Test home page
    console.log('Testing home page...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'test-screenshots/01-home-page.png' });

    // Test chat button
    console.log('Testing chat button...');
    const chatButton = await page.$('#chat-button');
    if (chatButton) {
      console.log('Chat button found');
      await chatButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({ path: 'test-screenshots/02-chat-button-clicked.png' });
    } else {
      console.error('Chat button not found');
    }

    // Test document chat page
    console.log('Testing document chat page...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app/document-chat', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'test-screenshots/03-document-chat-page.png' });

    // Test document selector
    console.log('Testing document selector...');
    const documentSelector = await page.$('#document-select');
    if (documentSelector) {
      console.log('Document selector found');
      await documentSelector.select('doc-1');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({ path: 'test-screenshots/04-document-selected.png' });
    } else {
      console.error('Document selector not found');
    }

    // Test document chat input
    console.log('Testing document chat input...');
    const documentChatInput = await page.$('#document-chat-input');
    if (documentChatInput) {
      console.log('Document chat input found');
      await documentChatInput.type('What is the total revenue?');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({ path: 'test-screenshots/05-document-chat-input.png' });
    } else {
      console.error('Document chat input not found');
    }

    // Test document chat send button
    console.log('Testing document chat send button...');
    const documentChatSendButton = await page.$('#document-send-btn');
    if (documentChatSendButton) {
      console.log('Document chat send button found');
      await documentChatSendButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({ path: 'test-screenshots/06-document-chat-send.png' });
    } else {
      console.error('Document chat send button not found');
    }

    // Test document details page
    console.log('Testing document details page...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app/document-details.html?id=doc-1', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'test-screenshots/07-document-details-page.png' });

    // Test process document button
    console.log('Testing process document button...');
    const processDocumentButton = await page.$('#process-document-btn');
    if (processDocumentButton) {
      console.log('Process document button found');
      await processDocumentButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({ path: 'test-screenshots/08-process-document-button-clicked.png' });
    } else {
      console.error('Process document button not found');
    }

    // Test login page
    console.log('Testing login page...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app/login', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'test-screenshots/09-login-page.png' });

    // Test login form
    console.log('Testing login form...');
    const loginForm = await page.$('#login-form');
    if (loginForm) {
      console.log('Login form found');
    } else {
      console.error('Login form not found');
    }

    // Test Google login button
    console.log('Testing Google login button...');
    const googleLoginButton = await page.$('#google-login-btn');
    if (googleLoginButton) {
      console.log('Google login button found');
    } else {
      console.error('Google login button not found');
    }

    // Test signup page
    console.log('Testing signup page...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app/signup', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'test-screenshots/10-signup-page.png' });

    // Test register form
    console.log('Testing register form...');
    const registerForm = await page.$('#register-form');
    if (registerForm) {
      console.log('Register form found');
    } else {
      console.error('Register form not found');
    }

    // Test test page
    console.log('Testing test page...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app/test', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'test-screenshots/11-test-page.png' });

    // Test agent cards
    console.log('Testing agent cards...');
    const agentCards = await page.$$('.agent-card');
    if (agentCards.length > 0) {
      console.log(`${agentCards.length} agent cards found`);
    } else {
      console.error('No agent cards found');
    }

    console.log('UI components test completed successfully');
  } catch (error) {
    console.error('Error testing UI components:', error);
  } finally {
    await browser.close();
  }
}

testUIComponents();
