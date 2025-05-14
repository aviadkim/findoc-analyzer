const { chromium } = require('playwright');

async function checkProcessButton() {
  console.log('Checking for process button on upload page...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the upload page
    console.log('Navigating to upload page...');
    await page.goto('https://backv2-app-brfi73d4ra-zf.a.run.app/upload');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot
    await page.screenshot({ path: 'upload-page.png' });
    console.log('Screenshot saved to upload-page.png');
    
    // Check if the process button exists
    const processBtn = await page.$('#process-btn');
    if (processBtn) {
      console.log('✅ Process button found!');
      
      // Check if it's visible
      const isVisible = await processBtn.isVisible();
      console.log(`Process button is ${isVisible ? 'visible' : 'not visible'}`);
      
      // Get button properties
      const buttonText = await processBtn.textContent();
      console.log(`Button text: "${buttonText}"`);
      
      // Check button styling
      const buttonStyle = await page.evaluate(btn => {
        const style = window.getComputedStyle(btn);
        return {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          backgroundColor: style.backgroundColor,
          position: style.position,
          zIndex: style.zIndex
        };
      }, processBtn);
      
      console.log('Button styling:', buttonStyle);
    } else {
      console.log('❌ Process button not found!');
      
      // Check for any buttons on the page
      const buttons = await page.$$('button');
      console.log(`Found ${buttons.length} buttons on the page:`);
      
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const buttonText = await button.textContent();
        const buttonId = await button.getAttribute('id');
        const buttonClass = await button.getAttribute('class');
        
        console.log(`Button ${i+1}: Text="${buttonText}", ID="${buttonId}", Class="${buttonClass}"`);
      }
    }
    
    // Check for the floating process button
    const floatingBtn = await page.$('#floating-process-btn');
    if (floatingBtn) {
      console.log('✅ Floating process button found!');
      
      // Check if it's visible
      const isVisible = await floatingBtn.isVisible();
      console.log(`Floating process button is ${isVisible ? 'visible' : 'not visible'}`);
    } else {
      console.log('❌ Floating process button not found!');
    }
    
    // Check if our CSS and JS files are loaded
    const cssLoaded = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      return links.some(link => link.href.includes('process-button-fix.css'));
    });
    
    console.log(`CSS file is ${cssLoaded ? 'loaded' : 'not loaded'}`);
    
    const jsLoaded = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.some(script => script.src && script.src.includes('process-button-fix.js'));
    });
    
    console.log(`JS file is ${jsLoaded ? 'loaded' : 'not loaded'}`);
    
    // Wait for user to see the page
    console.log('Waiting for 10 seconds...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkProcessButton();
