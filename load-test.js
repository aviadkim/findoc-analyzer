const { chromium } = require('playwright');

// Configuration
const config = {
  url: 'https://findoc-deploy.ey.r.appspot.com',
  screenshotsDir: './test-screenshots-load',
  concurrentUsers: 5, // Number of concurrent users
  headless: true, // Run in headless mode for load testing
  duration: 60000 // Test duration in milliseconds (60 seconds)
};

// User simulation function
async function simulateUser(userId) {
  console.log(`User ${userId}: Starting simulation`);
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: config.headless
  });
  
  // Create a new context
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  // Create a new page
  const page = await context.newPage();
  
  try {
    // Start time
    const startTime = Date.now();
    
    // Keep simulating user activity until the duration is reached
    while (Date.now() - startTime < config.duration) {
      // Randomly choose a page to visit
      const pages = ['/', '/upload', '/chat', '/analytics', '/export'];
      const randomPage = pages[Math.floor(Math.random() * pages.length)];
      
      console.log(`User ${userId}: Visiting ${randomPage}`);
      
      // Visit the page and measure response time
      const pageStartTime = Date.now();
      await page.goto(`${config.url}${randomPage}`);
      const pageLoadTime = Date.now() - pageStartTime;
      
      console.log(`User ${userId}: Page ${randomPage} loaded in ${pageLoadTime}ms`);
      
      // Take a screenshot
      await page.screenshot({ path: `${config.screenshotsDir}/user-${userId}-${randomPage.replace('/', '-')}-${Date.now()}.png` });
      
      // Wait a random amount of time (1-5 seconds) before the next action
      await page.waitForTimeout(1000 + Math.random() * 4000);
    }
  } catch (error) {
    console.error(`User ${userId}: Error during simulation:`, error);
  } finally {
    // Close browser
    await browser.close();
    console.log(`User ${userId}: Simulation completed`);
  }
}

// Main function
async function runLoadTest() {
  console.log(`Starting load test with ${config.concurrentUsers} concurrent users for ${config.duration / 1000} seconds`);
  
  // Create screenshots directory if it doesn't exist
  const fs = require('fs');
  if (!fs.existsSync(config.screenshotsDir)) {
    fs.mkdirSync(config.screenshotsDir, { recursive: true });
  }
  
  // Start user simulations
  const userPromises = [];
  for (let i = 1; i <= config.concurrentUsers; i++) {
    userPromises.push(simulateUser(i));
  }
  
  // Wait for all user simulations to complete
  await Promise.all(userPromises);
  
  console.log('Load test completed');
}

// Run the load test
runLoadTest().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
