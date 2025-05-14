/**
 * Puppeteer test script for FinDoc Analyzer
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const config = {
  baseUrl: 'http://localhost:8080',
  screenshotDir: './test-screenshots',
};

// Ensure screenshot directory exists
if (!fs.existsSync(config.screenshotDir)) {
  fs.mkdirSync(config.screenshotDir, { recursive: true });
}

// Test suite
(async () => {
  console.log('Starting Puppeteer test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Test 1: Application loads correctly
    console.log('\nTest 1: Application loads correctly');
    await page.goto(config.baseUrl, { waitUntil: 'networkidle2' });
    
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    await page.screenshot({ path: path.join(config.screenshotDir, 'puppeteer-test-homepage.png') });
    console.log('✅ Test 1 completed');
    
    // Test 2: Check for sidebar navigation
    console.log('\nTest 2: Check for sidebar navigation');
    const sidebarExists = await page.evaluate(() => {
      return !!document.querySelector('.sidebar') || !!document.querySelector('nav');
    });
    
    console.log(`Sidebar exists: ${sidebarExists}`);
    
    if (sidebarExists) {
      // Get all navigation links
      const navLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.sidebar a, nav a'));
        return links.map(link => ({
          text: link.innerText.trim(),
          href: link.getAttribute('href')
        }));
      });
      
      console.log('Navigation links found:');
      navLinks.forEach(link => console.log(`- ${link.text} (${link.href})`));
      
      // Try to navigate to Documents page
      if (navLinks.some(link => link.text.includes('Document') || link.href.includes('document'))) {
        console.log('Attempting to navigate to Documents page...');
        
        await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('.sidebar a, nav a'));
          const documentsLink = links.find(link => 
            link.innerText.includes('Document') || 
            link.href.includes('document')
          );
          
          if (documentsLink) documentsLink.click();
        });
        
        await page.waitForTimeout(2000);
        console.log(`Current URL after navigation: ${page.url()}`);
        await page.screenshot({ path: path.join(config.screenshotDir, 'puppeteer-test-documents.png') });
      }
    }
    
    console.log('✅ Test 2 completed');
    
    // Test 3: Check for chat functionality
    console.log('\nTest 3: Check for chat functionality');
    
    // Navigate to document chat page if possible
    await page.goto(`${config.baseUrl}/document-chat.html`, { waitUntil: 'networkidle2' });
    
    const chatInputExists = await page.evaluate(() => {
      return !!document.querySelector('input[placeholder*="question"]') || 
             !!document.querySelector('textarea[placeholder*="question"]') ||
             !!document.querySelector('#question-input') ||
             !!document.querySelector('#chat-input');
    });
    
    console.log(`Chat input exists: ${chatInputExists}`);
    
    if (chatInputExists) {
      console.log('Chat functionality found, testing interaction...');
      
      await page.evaluate(() => {
        const input = document.querySelector('input[placeholder*="question"]') || 
                     document.querySelector('textarea[placeholder*="question"]') ||
                     document.querySelector('#question-input') ||
                     document.querySelector('#chat-input');
        
        if (input) input.value = 'What securities are in this document?';
        
        const button = document.querySelector('button:not([disabled]):not([aria-disabled="true"]):not([style*="display: none"]):not([style*="visibility: hidden"])');
        if (button) button.click();
      });
      
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(config.screenshotDir, 'puppeteer-test-chat.png') });
    }
    
    console.log('✅ Test 3 completed');
    
    // Test 4: Check for securities visualization
    console.log('\nTest 4: Check for securities visualization');
    
    // Navigate to document details page
    await page.goto(`${config.baseUrl}/document-details.html`, { waitUntil: 'networkidle2' });
    
    const tablesExist = await page.evaluate(() => {
      return !!document.querySelector('table') || 
             !!document.querySelector('.securities-table') ||
             !!document.querySelector('#extracted-tables');
    });
    
    console.log(`Tables exist: ${tablesExist}`);
    
    if (tablesExist) {
      console.log('Tables found, checking content...');
      
      const tableContent = await page.evaluate(() => {
        const tables = document.querySelectorAll('table');
        return Array.from(tables).map(table => {
          const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText.trim());
          const rows = Array.from(table.querySelectorAll('tr')).slice(1).map(row => {
            return Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim());
          });
          
          return { headers, rows };
        });
      });
      
      console.log(`Found ${tableContent.length} tables`);
      if (tableContent.length > 0) {
        console.log('First table headers:', tableContent[0].headers);
        console.log(`First table has ${tableContent[0].rows.length} rows`);
      }
      
      await page.screenshot({ path: path.join(config.screenshotDir, 'puppeteer-test-tables.png') });
    }
    
    console.log('✅ Test 4 completed');
    
    // Wait for 5 seconds to see the page
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: path.join(config.screenshotDir, 'puppeteer-test-error.png') });
  } finally {
    await browser.close();
  }
})();
