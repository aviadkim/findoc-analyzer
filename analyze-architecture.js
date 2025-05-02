/**
 * Analyze Architecture
 * 
 * This script analyzes the architecture of the deployed FinDoc Analyzer application.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  url: 'https://findoc-deploy.ey.r.appspot.com',
  screenshotsDir: path.join(__dirname, 'architecture-analysis'),
  timeout: 30000 // 30 seconds
};

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

/**
 * Take a screenshot
 * @param {object} page - Puppeteer page
 * @param {string} name - Screenshot name
 * @returns {Promise<void>}
 */
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(config.screenshotsDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
}

/**
 * Analyze page structure
 * @param {object} page - Puppeteer page
 * @param {string} url - URL to analyze
 * @param {string} name - Name for the analysis
 * @returns {Promise<object>} Analysis results
 */
async function analyzePage(page, url, name) {
  console.log(`Analyzing page: ${url}`);
  
  // Navigate to the page
  await page.goto(url, { timeout: config.timeout, waitUntil: 'networkidle2' });
  
  // Take a screenshot
  await takeScreenshot(page, name);
  
  // Get page title
  const title = await page.title();
  
  // Get all scripts
  const scripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script')).map(script => {
      return {
        src: script.src,
        type: script.type,
        content: script.innerText.substring(0, 100) + (script.innerText.length > 100 ? '...' : '')
      };
    });
  });
  
  // Get all stylesheets
  const stylesheets = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => {
      return {
        href: link.href
      };
    });
  });
  
  // Get all navigation links
  const navLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => {
      return {
        href: a.href,
        text: a.innerText.trim()
      };
    });
  });
  
  // Check for React
  const hasReact = await page.evaluate(() => {
    return window.React !== undefined || 
           document.querySelector('[data-reactroot]') !== null ||
           Array.from(document.querySelectorAll('*')).some(el => 
             Object.keys(el).some(key => key.startsWith('__reactInternalInstance$'))
           );
  });
  
  // Check for Next.js
  const hasNextJs = await page.evaluate(() => {
    return window.__NEXT_DATA__ !== undefined || 
           document.querySelector('#__next') !== null;
  });
  
  // Get HTML structure
  const htmlStructure = await page.evaluate(() => {
    function getElementStructure(element, depth = 0, maxDepth = 3) {
      if (depth > maxDepth) return '...';
      
      const children = Array.from(element.children).map(child => 
        getElementStructure(child, depth + 1, maxDepth)
      );
      
      return {
        tag: element.tagName.toLowerCase(),
        id: element.id || undefined,
        className: element.className || undefined,
        children: children.length > 0 ? children : undefined
      };
    }
    
    return getElementStructure(document.documentElement);
  });
  
  return {
    url,
    title,
    scripts,
    stylesheets,
    navLinks: navLinks.slice(0, 10), // Limit to first 10 links
    hasReact,
    hasNextJs,
    htmlStructure
  };
}

/**
 * Run the analysis
 */
async function runAnalysis() {
  console.log('Starting architecture analysis...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Pages to analyze
    const pages = [
      { url: `${config.url}/`, name: '01-homepage' },
      { url: `${config.url}/documents.html`, name: '02-documents' },
      { url: `${config.url}/analytics.html`, name: '03-analytics' },
      { url: `${config.url}/upload.html`, name: '04-upload' }
    ];
    
    // Analyze each page
    const results = [];
    for (const pageInfo of pages) {
      const result = await analyzePage(page, pageInfo.url, pageInfo.name);
      results.push(result);
    }
    
    // Save results to file
    const resultsPath = path.join(config.screenshotsDir, 'analysis-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`Analysis results saved to: ${resultsPath}`);
    
    // Generate HTML report
    const reportPath = path.join(config.screenshotsDir, 'analysis-report.html');
    const reportHtml = generateHtmlReport(results);
    fs.writeFileSync(reportPath, reportHtml);
    console.log(`Analysis report saved to: ${reportPath}`);
    
    console.log('Architecture analysis completed.');
  } catch (error) {
    console.error('Error during architecture analysis:', error);
  } finally {
    // Close browser
    await browser.close();
  }
}

/**
 * Generate HTML report
 * @param {Array<object>} results - Analysis results
 * @returns {string} HTML report
 */
function generateHtmlReport(results) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer Architecture Analysis</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .page-analysis {
      margin-bottom: 40px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 5px;
    }
    .screenshot {
      max-width: 100%;
      border: 1px solid #ddd;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 20px;
    }
    .technology-badge {
      display: inline-block;
      padding: 5px 10px;
      background-color: #e9ecef;
      border-radius: 3px;
      margin-right: 10px;
      margin-bottom: 10px;
    }
    .technology-badge.detected {
      background-color: #d4edda;
      color: #155724;
    }
    .technology-badge.not-detected {
      background-color: #f8d7da;
      color: #721c24;
    }
    pre {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer Architecture Analysis</h1>
  
  <div class="section">
    <h2>Summary</h2>
    <p>This report analyzes the architecture of the deployed FinDoc Analyzer application.</p>
    
    <h3>Technologies Detected</h3>
    <div>
      <span class="technology-badge ${results.some(r => r.hasReact) ? 'detected' : 'not-detected'}">
        React: ${results.some(r => r.hasReact) ? 'Detected' : 'Not Detected'}
      </span>
      <span class="technology-badge ${results.some(r => r.hasNextJs) ? 'detected' : 'not-detected'}">
        Next.js: ${results.some(r => r.hasNextJs) ? 'Detected' : 'Not Detected'}
      </span>
    </div>
    
    <h3>Pages Analyzed</h3>
    <ul>
      ${results.map(result => `<li><a href="#${result.url.split('/').pop() || 'homepage'}">${result.title}</a></li>`).join('')}
    </ul>
  </div>
  
  ${results.map(result => `
    <div id="${result.url.split('/').pop() || 'homepage'}" class="page-analysis">
      <h2>${result.title}</h2>
      <p><strong>URL:</strong> ${result.url}</p>
      
      <div class="section">
        <h3>Screenshot</h3>
        <img src="${result.url.split('/').pop() || '01-homepage'}.png" alt="${result.title}" class="screenshot">
      </div>
      
      <div class="section">
        <h3>Technologies</h3>
        <p>
          <span class="technology-badge ${result.hasReact ? 'detected' : 'not-detected'}">
            React: ${result.hasReact ? 'Detected' : 'Not Detected'}
          </span>
          <span class="technology-badge ${result.hasNextJs ? 'detected' : 'not-detected'}">
            Next.js: ${result.hasNextJs ? 'Detected' : 'Not Detected'}
          </span>
        </p>
      </div>
      
      <div class="section">
        <h3>Scripts</h3>
        <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Type</th>
              <th>Content</th>
            </tr>
          </thead>
          <tbody>
            ${result.scripts.map(script => `
              <tr>
                <td>${script.src || 'Inline'}</td>
                <td>${script.type || 'text/javascript'}</td>
                <td>${script.src ? '' : `<pre>${script.content}</pre>`}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <h3>Stylesheets</h3>
        <ul>
          ${result.stylesheets.map(stylesheet => `<li>${stylesheet.href}</li>`).join('')}
        </ul>
      </div>
      
      <div class="section">
        <h3>Navigation Links</h3>
        <table>
          <thead>
            <tr>
              <th>Text</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            ${result.navLinks.map(link => `
              <tr>
                <td>${link.text}</td>
                <td>${link.href}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `).join('')}
</body>
</html>`;
}

// Run the analysis
runAnalysis();
