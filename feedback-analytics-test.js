const { test, expect } = require('@playwright/test');

/**
 * Test suite for User Feedback and Analytics features
 */

// Test the feedback form
test('Feedback form should load and submit correctly', async ({ page }) => {
  // Navigate to the feedback page
  await page.goto('http://localhost:3002/feedback');
  
  // Wait for the page to load
  await page.waitForSelector('.feedback-page');
  
  // Take a screenshot of the feedback page
  await page.screenshot({ path: 'test-results/feedback-page.png' });
  
  // Check if the new form toggle is present
  const formToggle = await page.locator('.form-toggle');
  await expect(formToggle).toBeVisible();
  
  // Click on the "New Form" button
  await page.click('.form-toggle button:first-child');
  
  // Wait for the new form to load
  await page.waitForSelector('.new-form-container');
  
  // Fill out the feedback form
  await page.locator('input[value="general"]').check();
  await page.locator('input[value="ui"]').check();
  await page.locator('textarea#comments').fill('This is a test feedback submission from automated tests.');
  await page.locator('input#allowContact').check();
  await page.locator('input#email').fill('test@example.com');
  
  // Take a screenshot of the filled form
  await page.screenshot({ path: 'test-results/feedback-form-filled.png' });
  
  // Mock the API response
  await page.route('/api/feedback', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Feedback submitted successfully',
        feedback: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          feedback_type: 'general',
          rating: 3,
          categories: ['ui'],
          comments: 'This is a test feedback submission from automated tests.',
          email: 'test@example.com',
          allow_contact: true,
          created_at: new Date().toISOString()
        }
      })
    });
  });
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Wait for the success message
  await page.waitForSelector('.bg-green-50');
  
  // Take a screenshot of the success message
  await page.screenshot({ path: 'test-results/feedback-success.png' });
  
  // Verify the success message
  const successMessage = await page.locator('.bg-green-50 p');
  await expect(successMessage).toContainText('Thank you for your feedback');
});

// Test the analytics dashboard
test('Analytics dashboard should load and display data', async ({ page }) => {
  // Navigate to the analytics dashboard page
  await page.goto('http://localhost:3002/analytics-dashboard');
  
  // Wait for the page to load
  await page.waitForSelector('.analytics-dashboard');
  
  // Take a screenshot of the analytics dashboard
  await page.screenshot({ path: 'test-results/analytics-dashboard.png' });
  
  // Mock the API response
  await page.route('/api/analytics/dashboard*', async route => {
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
  
  // Wait for the charts to load
  await page.waitForSelector('.chart-container');
  
  // Check if the time range selector is present
  const timeRangeSelector = await page.locator('.time-range-selector');
  await expect(timeRangeSelector).toBeVisible();
  
  // Click on different time range buttons
  await page.click('.time-range-btn:nth-child(1)'); // 24 Hours
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/analytics-dashboard-24h.png' });
  
  await page.click('.time-range-btn:nth-child(2)'); // 7 Days
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/analytics-dashboard-7d.png' });
  
  await page.click('.time-range-btn:nth-child(3)'); // 30 Days
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/analytics-dashboard-30d.png' });
  
  await page.click('.time-range-btn:nth-child(4)'); // 90 Days
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/analytics-dashboard-90d.png' });
  
  // Check if the charts are present
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
});

// Test the analytics tracking
test('Analytics tracking should work correctly', async ({ page }) => {
  // Mock the analytics API
  await page.route('/api/analytics/events', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Analytics event recorded successfully'
      })
    });
  });
  
  // Navigate to the dashboard page
  await page.goto('http://localhost:3002/');
  
  // Wait for the page to load
  await page.waitForSelector('.dashboard-container');
  
  // Take a screenshot of the dashboard
  await page.screenshot({ path: 'test-results/dashboard-page.png' });
  
  // Check network requests to verify analytics events
  const analyticsRequests = [];
  page.on('request', request => {
    if (request.url().includes('/api/analytics/events')) {
      analyticsRequests.push(request);
    }
  });
  
  // Perform some actions that should trigger analytics events
  await page.click('a[href="/documents-new"]');
  await page.waitForSelector('.documents-container');
  await page.screenshot({ path: 'test-results/documents-page.png' });
  
  await page.click('a[href="/upload"]');
  await page.waitForSelector('.upload-container');
  await page.screenshot({ path: 'test-results/upload-page.png' });
  
  // Wait for analytics events to be sent
  await page.waitForTimeout(1000);
  
  // Verify that analytics events were sent
  expect(analyticsRequests.length).toBeGreaterThan(0);
});
