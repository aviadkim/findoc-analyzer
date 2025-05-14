/**
 * Check Console Logs
 * Checks the browser console logs for errors
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Main function
async function checkConsoleLogs() {
  console.log('Starting Console Logs Check...');

  // Create logs directory
  const logsDir = path.join(__dirname, 'console-logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Create logs file
  const logsFile = path.join(logsDir, 'console-logs.txt');
  fs.writeFileSync(logsFile, 'Console Logs Check\n\n');

  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  try {
    // Set deployed URL
    const deployedUrl = 'https://backv2-app-brfi73d4ra-zf.a.run.app';

    // Collect console logs
    page.on('console', message => {
      const text = `[${message.type()}] ${message.text()}`;
      console.log(text);
      fs.appendFileSync(logsFile, text + '\n');
    });

    // Collect errors
    page.on('pageerror', error => {
      const text = `[ERROR] ${error.message}`;
      console.error(text);
      fs.appendFileSync(logsFile, text + '\n');
    });

    // Collect request failures
    page.on('requestfailed', request => {
      const text = `[REQUEST FAILED] ${request.url()} - ${request.failure().errorText}`;
      console.error(text);
      fs.appendFileSync(logsFile, text + '\n');
    });

    // Define pages to check
    const pages = [
      { path: '', name: 'Home' },
      { path: '/upload', name: 'Upload' },
      { path: '/documents-new', name: 'Documents' },
      { path: '/analytics-new', name: 'Analytics' },
      { path: '/document-details.html', name: 'Document Details' },
      { path: '/test', name: 'Test' }
    ];

    // Check each page
    for (const pageInfo of pages) {
      console.log(`Checking ${pageInfo.name} page...`);
      fs.appendFileSync(logsFile, `\n--- ${pageInfo.name} Page (${deployedUrl}${pageInfo.path}) ---\n\n`);

      // Navigate to page
      await page.goto(`${deployedUrl}${pageInfo.path}`, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for any potential errors
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check network requests
      const requests = await page.evaluate(() => {
        return performance.getEntriesByType('resource').map(resource => {
          return {
            name: resource.name,
            duration: resource.duration,
            initiatorType: resource.initiatorType
          };
        });
      });

      fs.appendFileSync(logsFile, `\nNetwork Requests:\n`);
      requests.forEach(request => {
        fs.appendFileSync(logsFile, `${request.name} (${request.initiatorType}) - ${request.duration}ms\n`);
      });

      // Check HTML source
      const html = await page.content();
      const htmlFile = path.join(logsDir, `${pageInfo.path.replace(/\//g, '-') || 'home'}.html`);
      fs.writeFileSync(htmlFile, html);

      // Check if scripts are injected
      const scripts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('script')).map(script => script.src);
      });

      fs.appendFileSync(logsFile, `\nInjected Scripts:\n`);
      scripts.forEach(script => {
        fs.appendFileSync(logsFile, `${script}\n`);
      });

      console.log(`Completed checking ${pageInfo.name} page`);
    }

    console.log(`\nLogs saved to ${logsFile}`);

  } catch (error) {
    console.error('Error during check:', error);
    fs.appendFileSync(logsFile, `\nError during check: ${error.message}\n`);
  } finally {
    // Wait for user to press a key
    console.log('\nPress any key to close the browser...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => {
      browser.close();
      process.exit(0);
    });
  }
}

// Run the check
checkConsoleLogs().catch(console.error);
