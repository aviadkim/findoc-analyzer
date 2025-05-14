const { test, expect } = require('@playwright/test');
const { login } = require('./utils/test-helpers');

// Performance thresholds
const LOAD_TIME_THRESHOLD = 3000; // 3 seconds
const TIME_TO_INTERACTIVE_THRESHOLD = 4000; // 4 seconds
const RENDER_TIME_THRESHOLD = 1000; // 1 second

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should load dashboard quickly', async ({ page }) => {
    // Start performance measurement
    await page.evaluate(() => window.performance.mark('start_navigation'));
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Mark end of navigation
    await page.evaluate(() => {
      window.performance.mark('end_navigation');
      window.performance.measure('navigation_time', 'start_navigation', 'end_navigation');
      return window.performance.getEntriesByName('navigation_time')[0].duration;
    });
    
    // Get navigation timing
    const navigationTiming = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('navigation');
      return {
        loadTime: perfEntries[0].loadEventEnd - perfEntries[0].startTime,
        domContentLoaded: perfEntries[0].domContentLoadedEventEnd - perfEntries[0].startTime,
        firstPaint: perfEntries[0].responseEnd - perfEntries[0].startTime,
      };
    });
    
    // Check performance metrics
    expect(navigationTiming.loadTime).toBeLessThan(LOAD_TIME_THRESHOLD);
    expect(navigationTiming.domContentLoaded).toBeLessThan(TIME_TO_INTERACTIVE_THRESHOLD);
    expect(navigationTiming.firstPaint).toBeLessThan(RENDER_TIME_THRESHOLD);
    
    // Log performance metrics
    console.log('Dashboard Performance Metrics:');
    console.log(`- Load Time: ${navigationTiming.loadTime.toFixed(2)}ms`);
    console.log(`- DOM Content Loaded: ${navigationTiming.domContentLoaded.toFixed(2)}ms`);
    console.log(`- First Paint: ${navigationTiming.firstPaint.toFixed(2)}ms`);
  });

  test('should render document list efficiently', async ({ page }) => {
    // Start performance measurement
    await page.evaluate(() => window.performance.mark('start_document_list'));
    
    // Navigate to documents
    await page.goto('/documents');
    
    // Wait for document list to appear
    await page.waitForSelector('[data-testid="documents-list"]');
    
    // Mark end of rendering
    const renderTime = await page.evaluate(() => {
      window.performance.mark('end_document_list');
      window.performance.measure('document_list_render_time', 'start_document_list', 'end_document_list');
      return window.performance.getEntriesByName('document_list_render_time')[0].duration;
    });
    
    // Check render time
    expect(renderTime).toBeLessThan(LOAD_TIME_THRESHOLD);
    
    // Measure time to load additional documents (lazy loading)
    await page.evaluate(() => window.performance.mark('start_scroll'));
    
    // Scroll down to trigger lazy loading
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    
    // Wait for additional items to load
    await page.waitForTimeout(1000);
    
    // Measure scroll response time
    const scrollTime = await page.evaluate(() => {
      window.performance.mark('end_scroll');
      window.performance.measure('scroll_time', 'start_scroll', 'end_scroll');
      return window.performance.getEntriesByName('scroll_time')[0].duration;
    });
    
    // Check scroll response time
    expect(scrollTime).toBeLessThan(RENDER_TIME_THRESHOLD);
    
    // Log performance metrics
    console.log('Document List Performance Metrics:');
    console.log(`- Initial Render Time: ${renderTime.toFixed(2)}ms`);
    console.log(`- Scroll Response Time: ${scrollTime.toFixed(2)}ms`);
  });

  test('should render charts efficiently', async ({ page }) => {
    // Navigate to portfolio
    await page.goto('/portfolio');
    
    // Wait for portfolio page to load
    await page.waitForSelector('[data-testid="portfolio-dashboard"]');
    
    // Measure time to render pie chart
    await page.evaluate(() => window.performance.mark('start_pie_chart'));
    
    // Switch to pie chart
    await page.click('[data-testid="chart-type-pie"]');
    
    // Wait for chart to appear
    await page.waitForSelector('[data-testid="pie-chart"]');
    
    // Measure pie chart render time
    const pieChartTime = await page.evaluate(() => {
      window.performance.mark('end_pie_chart');
      window.performance.measure('pie_chart_render_time', 'start_pie_chart', 'end_pie_chart');
      return window.performance.getEntriesByName('pie_chart_render_time')[0].duration;
    });
    
    // Check pie chart render time
    expect(pieChartTime).toBeLessThan(RENDER_TIME_THRESHOLD);
    
    // Measure time to render bar chart
    await page.evaluate(() => window.performance.mark('start_bar_chart'));
    
    // Switch to bar chart
    await page.click('[data-testid="chart-type-bar"]');
    
    // Wait for chart to appear
    await page.waitForSelector('[data-testid="bar-chart"]');
    
    // Measure bar chart render time
    const barChartTime = await page.evaluate(() => {
      window.performance.mark('end_bar_chart');
      window.performance.measure('bar_chart_render_time', 'start_bar_chart', 'end_bar_chart');
      return window.performance.getEntriesByName('bar_chart_render_time')[0].duration;
    });
    
    // Check bar chart render time
    expect(barChartTime).toBeLessThan(RENDER_TIME_THRESHOLD);
    
    // Log performance metrics
    console.log('Chart Rendering Performance Metrics:');
    console.log(`- Pie Chart Render Time: ${pieChartTime.toFixed(2)}ms`);
    console.log(`- Bar Chart Render Time: ${barChartTime.toFixed(2)}ms`);
  });

  test('should handle large document lists efficiently', async ({ page }) => {
    // Navigate to documents
    await page.goto('/documents');
    
    // Wait for document list to appear
    await page.waitForSelector('[data-testid="documents-list"]');
    
    // Measure search performance
    await page.evaluate(() => window.performance.mark('start_search'));
    
    // Perform search
    await page.fill('[data-testid="search-input"]', 'portfolio');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Measure search time
    const searchTime = await page.evaluate(() => {
      window.performance.mark('end_search');
      window.performance.measure('search_time', 'start_search', 'end_search');
      return window.performance.getEntriesByName('search_time')[0].duration;
    });
    
    // Check search time
    expect(searchTime).toBeLessThan(LOAD_TIME_THRESHOLD);
    
    // Measure filter performance
    await page.evaluate(() => window.performance.mark('start_filter'));
    
    // Apply filter
    await page.click('[data-testid="filter-dropdown"]');
    await page.click('[data-testid="filter-option-pdf"]');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Measure filter time
    const filterTime = await page.evaluate(() => {
      window.performance.mark('end_filter');
      window.performance.measure('filter_time', 'start_filter', 'end_filter');
      return window.performance.getEntriesByName('filter_time')[0].duration;
    });
    
    // Check filter time
    expect(filterTime).toBeLessThan(RENDER_TIME_THRESHOLD);
    
    // Log performance metrics
    console.log('Document List Operations Performance Metrics:');
    console.log(`- Search Time: ${searchTime.toFixed(2)}ms`);
    console.log(`- Filter Time: ${filterTime.toFixed(2)}ms`);
  });

  test('should handle theme switching efficiently', async ({ page }) => {
    // Navigate to preferences
    await page.goto('/preferences');
    
    // Measure theme switching performance
    await page.evaluate(() => window.performance.mark('start_theme_switch'));
    
    // Switch to dark theme
    await page.click('[data-testid="theme-selector"]');
    await page.click('[data-testid="theme-option-dark"]');
    await page.click('[data-testid="save-preferences-button"]');
    
    // Wait for theme to apply
    await page.waitForSelector('body.dark-theme');
    
    // Measure theme switch time
    const themeTime = await page.evaluate(() => {
      window.performance.mark('end_theme_switch');
      window.performance.measure('theme_switch_time', 'start_theme_switch', 'end_theme_switch');
      return window.performance.getEntriesByName('theme_switch_time')[0].duration;
    });
    
    // Check theme switch time
    expect(themeTime).toBeLessThan(LOAD_TIME_THRESHOLD);
    
    // Log performance metrics
    console.log('Theme Switching Performance Metrics:');
    console.log(`- Theme Switch Time: ${themeTime.toFixed(2)}ms`);
    
    // Reset theme
    await page.click('[data-testid="theme-selector"]');
    await page.click('[data-testid="theme-option-light"]');
    await page.click('[data-testid="save-preferences-button"]');
  });

  test('should load agent workspace efficiently', async ({ page }) => {
    // Measure navigation performance
    await page.evaluate(() => window.performance.mark('start_agent_workspace'));
    
    // Navigate to agents
    await page.goto('/agents');
    
    // Wait for agent workspace to appear
    await page.waitForSelector('[data-testid="agent-workspace"]');
    
    // Measure workspace load time
    const workspaceTime = await page.evaluate(() => {
      window.performance.mark('end_agent_workspace');
      window.performance.measure('agent_workspace_time', 'start_agent_workspace', 'end_agent_workspace');
      return window.performance.getEntriesByName('agent_workspace_time')[0].duration;
    });
    
    // Check workspace load time
    expect(workspaceTime).toBeLessThan(LOAD_TIME_THRESHOLD);
    
    // Measure pipeline builder performance
    await page.evaluate(() => window.performance.mark('start_pipeline_builder'));
    
    // Click create pipeline button
    await page.click('[data-testid="create-pipeline-button"]');
    
    // Wait for pipeline builder to appear
    await page.waitForSelector('[data-testid="pipeline-builder"]');
    
    // Measure pipeline builder load time
    const builderTime = await page.evaluate(() => {
      window.performance.mark('end_pipeline_builder');
      window.performance.measure('pipeline_builder_time', 'start_pipeline_builder', 'end_pipeline_builder');
      return window.performance.getEntriesByName('pipeline_builder_time')[0].duration;
    });
    
    // Check pipeline builder load time
    expect(builderTime).toBeLessThan(RENDER_TIME_THRESHOLD);
    
    // Log performance metrics
    console.log('Agent Workspace Performance Metrics:');
    console.log(`- Workspace Load Time: ${workspaceTime.toFixed(2)}ms`);
    console.log(`- Pipeline Builder Load Time: ${builderTime.toFixed(2)}ms`);
  });
});
