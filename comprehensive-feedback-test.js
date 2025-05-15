const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive test suite for User Feedback and Analytics features
 */

// Test configuration
const config = {
  baseUrl: 'http://localhost:3002',
  apiBaseUrl: 'http://localhost:3002/api',
  screenshotDir: 'test-results/feedback-analytics',
  waitTimeout: 30000,
};

// Create screenshot directory if it doesn't exist
if (!fs.existsSync(config.screenshotDir)) {
  fs.mkdirSync(config.screenshotDir, { recursive: true });
}

// Helper function to take a screenshot
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(config.screenshotDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

// Helper function to log test steps
function logStep(step) {
  console.log(`\n📋 ${step}`);
}

// Test the feedback form
test('Feedback form should load and submit correctly', async ({ page }) => {
  logStep('Navigating to the feedback page');
  await page.goto(`${config.baseUrl}/feedback`);
  
  logStep('Waiting for the page to load');
  await page.waitForSelector('.feedback-page', { timeout: config.waitTimeout });
  
  logStep('Taking a screenshot of the feedback page');
  await takeScreenshot(page, 'feedback-page');
  
  logStep('Checking if the form toggle is present');
  const formToggle = await page.locator('.form-toggle');
  await expect(formToggle).toBeVisible();
  
  logStep('Clicking on the "New Form" button');
  await page.click('.form-toggle button:first-child');
  
  logStep('Waiting for the new form to load');
  await page.waitForSelector('.new-form-container', { timeout: config.waitTimeout });
  
  logStep('Filling out the feedback form');
  await page.locator('input[name="feedbackType"][value="general"]').check();
  await page.locator('input[name="feedbackCategories"][value="ui"]').check();
  await page.locator('textarea[name="comments"]').fill('This is a test feedback submission from automated tests.');
  await page.locator('input[name="allowContact"]').check();
  await page.locator('input[name="email"]').fill('test@example.com');
  await page.locator('input[name="rating"][value="4"]').check();
  
  logStep('Taking a screenshot of the filled form');
  await takeScreenshot(page, 'feedback-form-filled');
  
  logStep('Mocking the API response');
  await page.route(`${config.apiBaseUrl}/feedback`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Feedback submitted successfully',
        feedback: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          feedback_type: 'general',
          rating: 4,
          categories: ['ui'],
          comments: 'This is a test feedback submission from automated tests.',
          email: 'test@example.com',
          allow_contact: true,
          created_at: new Date().toISOString()
        }
      })
    });
  });
  
  logStep('Submitting the form');
  await page.click('button[type="submit"]');
  
  logStep('Waiting for the success message');
  await page.waitForSelector('.success-message', { timeout: config.waitTimeout });
  
  logStep('Taking a screenshot of the success message');
  await takeScreenshot(page, 'feedback-success');
  
  logStep('Verifying the success message');
  const successMessage = await page.locator('.success-message h2');
  await expect(successMessage).toContainText('Thank You');
});

// Test the analytics dashboard
test('Analytics dashboard should load and display data', async ({ page }) => {
  logStep('Navigating to the analytics dashboard page');
  await page.goto(`${config.baseUrl}/analytics-dashboard`);
  
  logStep('Waiting for the page to load');
  await page.waitForSelector('.analytics-dashboard', { timeout: config.waitTimeout });
  
  logStep('Taking a screenshot of the analytics dashboard');
  await takeScreenshot(page, 'analytics-dashboard');
  
  logStep('Mocking the API response');
  await page.route(`${config.apiBaseUrl}/analytics/dashboard*`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        pageViews: [
          { date: '2023-06-01', count: 120 },
          { date: '2023-06-02', count: 145 },
          { date: '2023-06-03', count: 132 },
          { date: '2023-06-04', count: 167 },
          { date: '2023-06-05', count: 189 },
          { date: '2023-06-06', count: 204 },
          { date: '2023-06-07', count: 178 }
        ],
        featureUsage: [
          { feature_name: 'Document Upload', count: 45 },
          { feature_name: 'Document Processing', count: 38 },
          { feature_name: 'Document Chat', count: 27 },
          { feature_name: 'Analytics', count: 19 },
          { feature_name: 'Export', count: 12 }
        ],
        documentProcessing: [
          { document_type: 'PDF', count: 62 },
          { document_type: 'Excel', count: 34 },
          { document_type: 'CSV', count: 21 },
          { document_type: 'Word', count: 8 }
        ],
        errors: [
          { error_type: 'API Error', count: 7 },
          { error_type: 'Processing Error', count: 5 },
          { error_type: 'Authentication Error', count: 3 },
          { error_type: 'Network Error', count: 4 }
        ],
        feedback: [
          { 
            rating: 5, 
            count: 23,
            feedback_type: 'General',
            comments: 'Great application! Very useful for financial document analysis.',
            created_at: new Date().toISOString()
          },
          { 
            rating: 4, 
            count: 18,
            feedback_type: 'Feature Request',
            comments: 'Would be nice to have more export options.',
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          { 
            rating: 3, 
            count: 12,
            feedback_type: 'Bug Report',
            comments: 'Sometimes the document processing takes too long.',
            created_at: new Date(Date.now() - 172800000).toISOString()
          },
          { 
            rating: 2, 
            count: 7,
            feedback_type: 'UI/UX',
            comments: 'The interface could be more intuitive.',
            created_at: new Date(Date.now() - 259200000).toISOString()
          },
          { 
            rating: 1, 
            count: 4,
            feedback_type: 'Performance',
            comments: 'Application crashes when processing large files.',
            created_at: new Date(Date.now() - 345600000).toISOString()
          }
        ]
      })
    });
  });
  
  logStep('Waiting for the charts to load');
  await page.waitForSelector('.chart-container', { timeout: config.waitTimeout });
  
  logStep('Checking if the time range selector is present');
  const timeRangeSelector = await page.locator('.time-range-selector');
  await expect(timeRangeSelector).toBeVisible();
  
  logStep('Testing different time range selections');
  await page.click('.time-range-btn:nth-child(1)'); // 24 Hours
  await page.waitForTimeout(500);
  await takeScreenshot(page, 'analytics-dashboard-24h');
  
  await page.click('.time-range-btn:nth-child(2)'); // 7 Days
  await page.waitForTimeout(500);
  await takeScreenshot(page, 'analytics-dashboard-7d');
  
  await page.click('.time-range-btn:nth-child(3)'); // 30 Days
  await page.waitForTimeout(500);
  await takeScreenshot(page, 'analytics-dashboard-30d');
  
  await page.click('.time-range-btn:nth-child(4)'); // 90 Days
  await page.waitForTimeout(500);
  await takeScreenshot(page, 'analytics-dashboard-90d');
  
  logStep('Verifying chart components are present');
  const pageViewsChart = await page.locator('.dashboard-card:has-text("Page Views")');
  await expect(pageViewsChart).toBeVisible();
  
  const featureUsageChart = await page.locator('.dashboard-card:has-text("Feature Usage")');
  await expect(featureUsageChart).toBeVisible();
  
  const documentProcessingChart = await page.locator('.dashboard-card:has-text("Document Processing")');
  await expect(documentProcessingChart).toBeVisible();
  
  const feedbackRatingsChart = await page.locator('.dashboard-card:has-text("Feedback Ratings")');
  await expect(feedbackRatingsChart).toBeVisible();
  
  const recentFeedbackList = await page.locator('.dashboard-card:has-text("Recent Feedback")');
  await expect(recentFeedbackList).toBeVisible();
  
  logStep('Test completed successfully');
});

// Test the analytics tracking
test('Analytics tracking should work correctly', async ({ page }) => {
  logStep('Setting up analytics event tracking');
  const analyticsEvents = [];
  
  logStep('Mocking the analytics API');
  await page.route(`${config.apiBaseUrl}/analytics/events`, async route => {
    const postData = JSON.parse(route.request().postData());
    analyticsEvents.push(postData);
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Analytics event recorded successfully'
      })
    });
  });
  
  logStep('Navigating to the dashboard page');
  await page.goto(config.baseUrl);
  
  logStep('Waiting for the page to load');
  await page.waitForSelector('.dashboard-container', { timeout: config.waitTimeout });
  
  logStep('Taking a screenshot of the dashboard');
  await takeScreenshot(page, 'dashboard-page');
  
  logStep('Performing actions to trigger analytics events');
  await page.click('a[href="/documents-new"]');
  await page.waitForSelector('.documents-container', { timeout: config.waitTimeout });
  await takeScreenshot(page, 'documents-page');
  
  await page.click('a[href="/upload"]');
  await page.waitForSelector('.upload-container', { timeout: config.waitTimeout });
  await takeScreenshot(page, 'upload-page');
  
  logStep('Waiting for analytics events to be sent');
  await page.waitForTimeout(1000);
  
  logStep('Verifying analytics events were sent');
  expect(analyticsEvents.length).toBeGreaterThan(0);
  
  logStep('Checking analytics event data');
  for (const event of analyticsEvents) {
    expect(event).toHaveProperty('event_type');
    expect(event).toHaveProperty('event_data');
    expect(event).toHaveProperty('page');
    expect(event).toHaveProperty('user_agent');
  }
  
  logStep('Test completed successfully');
});
