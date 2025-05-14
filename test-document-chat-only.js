const { chromium } = require('playwright');

async function testDocumentChat() {
  console.log('Starting document chat test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate directly to the document chat page
    console.log('Navigating to document chat page...');
    await page.goto('https://backv2-app-brfi73d4ra-zf.a.run.app/document-chat');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the chat page
    await page.screenshot({ path: 'document-chat-initial.png' });
    console.log('Screenshot saved to document-chat-initial.png');
    
    // Wait for the page to fully load
    await page.waitForTimeout(3000);
    
    // Select the document from the dropdown if it exists
    const documentSelect = await page.$('#document-select');
    if (documentSelect) {
      // Get all options
      const options = await documentSelect.$$('option');
      console.log(`Found ${options.length} options in document selector`);
      
      if (options.length > 1) {
        // Select the second option (first is usually a placeholder)
        await documentSelect.selectOption({ index: 1 });
        console.log('Document selected from dropdown');
        
        // Wait for the chat interface to update
        await page.waitForTimeout(3000);
        
        // Take a screenshot after document selection
        await page.screenshot({ path: 'document-chat-selected.png' });
        console.log('Screenshot saved to document-chat-selected.png');
      } else {
        console.log('No documents found in the dropdown');
      }
    } else {
      console.log('Document selector not found');
      
      // Try to find any dropdown that might be the document selector
      const selects = await page.$$('select');
      console.log(`Found ${selects.length} select elements on the page`);
      
      if (selects.length > 0) {
        // Try the first select element
        const options = await selects[0].$$('option');
        console.log(`Found ${options.length} options in the first select element`);
        
        if (options.length > 1) {
          await selects[0].selectOption({ index: 1 });
          console.log('Selected first option from the first select element');
          
          // Wait for the chat interface to update
          await page.waitForTimeout(3000);
          
          // Take a screenshot after selection
          await page.screenshot({ path: 'document-chat-selected.png' });
          console.log('Screenshot saved to document-chat-selected.png');
        }
      }
    }
    
    // Find all input elements that might be the chat input
    const inputs = await page.$$('input, textarea');
    console.log(`Found ${inputs.length} input/textarea elements on the page`);
    
    // Find all buttons that might be the send button
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons on the page`);
    
    // Print the text content of each button
    for (let i = 0; i < buttons.length; i++) {
      const buttonText = await buttons[i].textContent();
      console.log(`Button ${i+1}: ${buttonText.trim()}`);
    }
    
    // Try to identify the chat input and send button
    let chatInput = null;
    let sendButton = null;
    
    // First try with specific selectors
    chatInput = await page.$('#document-chat-input') || 
                await page.$('textarea[placeholder*="Ask"]') || 
                await page.$('input[placeholder*="Ask"]') ||
                await page.$('.chat-input');
    
    sendButton = await page.$('#document-send-btn') || 
                 await page.$('button[type="submit"]') ||
                 await page.$('.send-button');
    
    // If not found, try to identify by examining all inputs and buttons
    if (!chatInput && inputs.length > 0) {
      // Try to find an input that looks like a chat input
      for (const input of inputs) {
        const placeholder = await input.getAttribute('placeholder') || '';
        if (placeholder.toLowerCase().includes('ask') || 
            placeholder.toLowerCase().includes('question') || 
            placeholder.toLowerCase().includes('message')) {
          chatInput = input;
          console.log(`Found potential chat input with placeholder: ${placeholder}`);
          break;
        }
      }
      
      // If still not found, just use the last input element (often the chat input)
      if (!chatInput) {
        chatInput = inputs[inputs.length - 1];
        console.log('Using last input element as chat input');
      }
    }
    
    if (!sendButton && buttons.length > 0) {
      // Try to find a button that looks like a send button
      for (const button of buttons) {
        const text = await button.textContent();
        if (text.toLowerCase().includes('send') || 
            text.toLowerCase().includes('submit') || 
            text.toLowerCase().includes('ask')) {
          sendButton = button;
          console.log(`Found potential send button with text: ${text}`);
          break;
        }
      }
      
      // If still not found, just use the last button (often the send button)
      if (!sendButton) {
        sendButton = buttons[buttons.length - 1];
        console.log('Using last button as send button');
      }
    }
    
    // Check if we found the chat input and send button
    if (chatInput && sendButton) {
      console.log('Found chat input and send button');
      
      // Ask questions about the document
      const questions = [
        'What is the total value of the portfolio?',
        'What are the top 3 holdings in the portfolio?',
        'What is the percentage of Apple stock in the portfolio?',
        'What is the average acquisition price of Microsoft shares?'
      ];
      
      for (const question of questions) {
        // Type the question
        await chatInput.fill(question);
        console.log(`Typed question: ${question}`);
        
        // Click the send button
        await sendButton.click();
        console.log('Send button clicked');
        
        // Wait for the response
        console.log('Waiting for response...');
        await page.waitForTimeout(5000);
        
        // Take a screenshot after each question
        await page.screenshot({ path: `question-${questions.indexOf(question) + 1}.png` });
        console.log(`Screenshot saved to question-${questions.indexOf(question) + 1}.png`);
        
        // Wait between questions
        await page.waitForTimeout(2000);
      }
    } else {
      console.log('Could not find chat input or send button');
      
      // Take a screenshot of the current state
      await page.screenshot({ path: 'chat-elements-not-found.png' });
      console.log('Screenshot saved to chat-elements-not-found.png');
    }
    
    // Wait for user to see the final result
    console.log('Test completed. Waiting for 30 seconds before closing...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-chat.png' });
    console.log('Error screenshot saved to error-chat.png');
  } finally {
    await browser.close();
  }
}

testDocumentChat();
