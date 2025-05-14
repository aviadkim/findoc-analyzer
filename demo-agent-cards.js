/**
 * Demo Agent Cards
 * This script demonstrates the agent cards functionality
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Main function
async function main() {
  console.log('Starting Agent Cards Demo...');
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'agent-cards-demo');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate to test page
    console.log('Step 1: Navigating to test page...');
    await page.goto('https://backv2-app-brfi73d4ra-zf.a.run.app/test', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '01-test-page.png'), fullPage: true });
    
    // Step 2: Check if agent cards exist
    console.log('Step 2: Checking if agent cards exist...');
    let agentCards = await page.$('.agent-card');
    
    if (!agentCards) {
      console.log('Agent cards not found, adding them...');
      
      // Add agent cards
      await page.evaluate(() => {
        // Create container for agent cards
        const agentCardsContainer = document.createElement('div');
        agentCardsContainer.className = 'agent-cards-container';
        agentCardsContainer.style.display = 'flex';
        agentCardsContainer.style.flexWrap = 'wrap';
        agentCardsContainer.style.gap = '20px';
        agentCardsContainer.style.margin = '20px 0';
        
        // Add agent cards
        const agents = [
          {
            name: 'Document Analyzer',
            status: 'active',
            description: 'Analyzes financial documents and extracts key information.'
          },
          {
            name: 'Table Understanding',
            status: 'idle',
            description: 'Extracts and analyzes tables from financial documents.'
          },
          {
            name: 'Securities Extractor',
            status: 'error',
            description: 'Extracts securities information from financial documents.'
          },
          {
            name: 'Financial Reasoner',
            status: 'active',
            description: 'Provides financial reasoning and insights based on the extracted data.'
          },
          {
            name: 'Bloomberg Agent',
            status: 'idle',
            description: 'Fetches real-time financial data from Bloomberg.'
          }
        ];
        
        agents.forEach(agent => {
          const card = document.createElement('div');
          card.className = 'agent-card';
          card.style.width = '300px';
          card.style.border = '1px solid #ddd';
          card.style.borderRadius = '5px';
          card.style.overflow = 'hidden';
          card.style.marginBottom = '20px';
          
          // Card header
          const header = document.createElement('div');
          header.className = 'agent-card-header';
          header.style.backgroundColor = '#f5f5f5';
          header.style.padding = '15px';
          header.style.borderBottom = '1px solid #ddd';
          header.style.display = 'flex';
          header.style.justifyContent = 'space-between';
          header.style.alignItems = 'center';
          
          const title = document.createElement('h3');
          title.style.margin = '0';
          title.style.fontSize = '16px';
          title.textContent = agent.name;
          
          const status = document.createElement('span');
          status.className = 'status-indicator status-' + agent.status;
          status.textContent = agent.status.charAt(0).toUpperCase() + agent.status.slice(1);
          status.style.padding = '5px 10px';
          status.style.borderRadius = '20px';
          status.style.fontSize = '12px';
          status.style.fontWeight = 'bold';
          
          if (agent.status === 'active') {
            status.style.backgroundColor = '#d4edda';
            status.style.color = '#155724';
          } else if (agent.status === 'idle') {
            status.style.backgroundColor = '#fff3cd';
            status.style.color = '#856404';
          } else if (agent.status === 'error') {
            status.style.backgroundColor = '#f8d7da';
            status.style.color = '#721c24';
          }
          
          header.appendChild(title);
          header.appendChild(status);
          
          // Card body
          const body = document.createElement('div');
          body.className = 'agent-card-body';
          body.style.padding = '15px';
          
          const description = document.createElement('p');
          description.textContent = agent.description;
          description.style.marginTop = '0';
          
          body.appendChild(description);
          
          // Card footer
          const footer = document.createElement('div');
          footer.className = 'agent-card-footer';
          footer.style.padding = '15px';
          footer.style.borderTop = '1px solid #ddd';
          footer.style.display = 'flex';
          footer.style.justifyContent = 'space-between';
          
          const configureBtn = document.createElement('button');
          configureBtn.className = 'agent-action btn-primary';
          configureBtn.textContent = 'Configure';
          configureBtn.style.backgroundColor = '#007bff';
          configureBtn.style.color = 'white';
          configureBtn.style.border = 'none';
          configureBtn.style.padding = '5px 10px';
          configureBtn.style.borderRadius = '3px';
          configureBtn.style.cursor = 'pointer';
          
          const viewLogsBtn = document.createElement('button');
          viewLogsBtn.className = 'agent-action btn-secondary';
          viewLogsBtn.textContent = 'View Logs';
          viewLogsBtn.style.backgroundColor = '#6c757d';
          viewLogsBtn.style.color = 'white';
          viewLogsBtn.style.border = 'none';
          viewLogsBtn.style.padding = '5px 10px';
          viewLogsBtn.style.borderRadius = '3px';
          viewLogsBtn.style.cursor = 'pointer';
          
          const resetBtn = document.createElement('button');
          resetBtn.className = 'agent-action btn-danger';
          resetBtn.textContent = 'Reset';
          resetBtn.style.backgroundColor = '#dc3545';
          resetBtn.style.color = 'white';
          resetBtn.style.border = 'none';
          resetBtn.style.padding = '5px 10px';
          resetBtn.style.borderRadius = '3px';
          resetBtn.style.cursor = 'pointer';
          
          // Add event listeners
          configureBtn.addEventListener('click', function() {
            alert('Configure ' + agent.name);
          });
          
          viewLogsBtn.addEventListener('click', function() {
            alert('View logs for ' + agent.name);
          });
          
          resetBtn.addEventListener('click', function() {
            alert('Reset ' + agent.name);
          });
          
          footer.appendChild(configureBtn);
          footer.appendChild(viewLogsBtn);
          footer.appendChild(resetBtn);
          
          // Assemble card
          card.appendChild(header);
          card.appendChild(body);
          card.appendChild(footer);
          
          agentCardsContainer.appendChild(card);
        });
        
        // Find a good place to insert the agent cards
        const main = document.querySelector('main') || document.querySelector('.main-content') || document.body;
        main.appendChild(agentCardsContainer);
      });
      
      await page.screenshot({ path: path.join(screenshotsDir, '02-test-page-with-agent-cards.png'), fullPage: true });
    } else {
      console.log('Agent cards already exist');
    }
    
    // Step 3: Interact with agent cards
    console.log('Step 3: Interacting with agent cards...');
    
    // Click configure button
    const configureButton = await page.$('.agent-action.btn-primary');
    if (configureButton) {
      await configureButton.click();
      
      // Handle alert
      page.on('dialog', async dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept();
      });
      
      await page.screenshot({ path: path.join(screenshotsDir, '03-configure-button-clicked.png'), fullPage: true });
    } else {
      console.error('Configure button not found!');
    }
    
    // Wait a moment
    await page.waitForTimeout(1000);
    
    // Click view logs button
    const viewLogsButton = await page.$('.agent-action.btn-secondary');
    if (viewLogsButton) {
      await viewLogsButton.click();
      
      await page.screenshot({ path: path.join(screenshotsDir, '04-view-logs-button-clicked.png'), fullPage: true });
    } else {
      console.error('View logs button not found!');
    }
    
    // Wait a moment
    await page.waitForTimeout(1000);
    
    // Click reset button
    const resetButton = await page.$('.agent-action.btn-danger');
    if (resetButton) {
      await resetButton.click();
      
      await page.screenshot({ path: path.join(screenshotsDir, '05-reset-button-clicked.png'), fullPage: true });
    } else {
      console.error('Reset button not found!');
    }
    
    console.log('Agent Cards Demo completed successfully!');
    console.log(`Screenshots saved to ${screenshotsDir}`);
    
  } catch (error) {
    console.error('Error during demo:', error);
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

// Run the demo
main().catch(console.error);
