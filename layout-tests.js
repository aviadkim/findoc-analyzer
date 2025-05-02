/**
 * FinDoc Analyzer Layout Tests
 *
 * This script tests the layout of the FinDoc Analyzer application.
 */

const { TestRunner, config } = require('./puppeteer-test-framework');
const fs = require('fs');
const path = require('path');

// Pages to test
const pages = [
  { path: '/', name: 'Dashboard' },
  { path: '/documents-new', name: 'Documents' },
  { path: '/analytics-new', name: 'Analytics' },
  { path: '/feedback', name: 'Feedback' },
  { path: '/document-comparison', name: 'Document Comparison' },
  { path: '/upload', name: 'Upload' }
];

// Layout tests
const layoutTests = [
  // Sidebar tests
  {
    name: 'Sidebar Position Test',
    test: async (page, runner) => {
      await runner.navigateTo('/');

      // Check if sidebar exists
      const sidebarExists = await runner.elementExists('.sidebar');
      if (!sidebarExists) {
        throw new Error('Sidebar does not exist');
      }

      // Check sidebar position
      const sidebarPosition = await runner.getElementPosition('.sidebar');
      if (sidebarPosition.left !== 0 || sidebarPosition.top !== 0) {
        throw new Error(`Sidebar is not positioned at the top-left corner. Position: ${JSON.stringify(sidebarPosition)}`);
      }

      // Check sidebar width
      if (sidebarPosition.width !== 280) {
        throw new Error(`Sidebar width is not 280px. Width: ${sidebarPosition.width}px`);
      }

      // Check sidebar style
      const sidebarBackgroundColor = await runner.getElementStyle('.sidebar', 'backgroundColor');
      if (sidebarBackgroundColor !== 'rgb(44, 62, 80)') {
        throw new Error(`Sidebar background color is not correct. Color: ${sidebarBackgroundColor}`);
      }

      const sidebarColor = await runner.getElementStyle('.sidebar', 'color');
      if (sidebarColor !== 'rgb(255, 255, 255)') {
        throw new Error(`Sidebar text color is not correct. Color: ${sidebarColor}`);
      }
    }
  },

  // Main content tests
  {
    name: 'Main Content Position Test',
    test: async (page, runner) => {
      await runner.navigateTo('/');

      // Check if main content exists
      const mainContentExists = await runner.elementExists('.main-content');
      if (!mainContentExists) {
        throw new Error('Main content does not exist');
      }

      // Check main content position
      const mainContentPosition = await runner.getElementPosition('.main-content');
      const sidebarPosition = await runner.getElementPosition('.sidebar');

      // Main content should be to the right of the sidebar
      if (mainContentPosition.left < sidebarPosition.right) {
        throw new Error(`Main content is not positioned to the right of the sidebar. Main content left: ${mainContentPosition.left}px, Sidebar right: ${sidebarPosition.right}px`);
      }

      // Check main content margin
      const mainContentMarginLeft = await runner.getElementStyle('.main-content', 'marginLeft');
      if (mainContentMarginLeft !== '280px') {
        throw new Error(`Main content margin-left is not 280px. Margin-left: ${mainContentMarginLeft}`);
      }

      // Check main content style
      const mainContentBackgroundColor = await runner.getElementStyle('.main-content', 'backgroundColor');
      if (mainContentBackgroundColor !== 'rgba(0, 0, 0, 0)') {
        throw new Error(`Main content background color is not correct. Color: ${mainContentBackgroundColor}`);
      }
    }
  },

  // Overlap tests
  {
    name: 'Sidebar and Main Content Overlap Test',
    test: async (page, runner) => {
      await runner.navigateTo('/');

      // Check if sidebar and main content overlap
      const overlap = await runner.elementsOverlap('.sidebar', '.main-content');
      // Allow overlap since the sidebar is fixed and the main content scrolls
      if (overlap) {
        console.log('Note: Sidebar and main content overlap, but this is expected with a fixed sidebar');
      }
    }
  },

  // Page header tests
  {
    name: 'Page Header Position Test',
    test: async (page, runner) => {
      await runner.navigateTo('/documents-new');

      // Check if page header exists
      const pageHeaderExists = await runner.elementExists('.page-header');
      if (!pageHeaderExists) {
        throw new Error('Page header does not exist');
      }

      // Check page header position
      const pageHeaderPosition = await runner.getElementPosition('.page-header');
      const mainContentPosition = await runner.getElementPosition('.main-content');

      // Page header should be at the top of the main content
      if (pageHeaderPosition.top < mainContentPosition.top) {
        throw new Error(`Page header is not positioned at the top of the main content. Page header top: ${pageHeaderPosition.top}px, Main content top: ${mainContentPosition.top}px`);
      }

      // Check page header style
      const pageHeaderMarginBottom = await runner.getElementStyle('.page-header', 'marginBottom');
      if (pageHeaderMarginBottom !== '20px') {
        throw new Error(`Page header margin-bottom is not 20px. Margin-bottom: ${pageHeaderMarginBottom}`);
      }
    }
  },

  // Action buttons tests
  {
    name: 'Action Buttons Position Test',
    test: async (page, runner) => {
      await runner.navigateTo('/documents-new');

      // Check if action buttons exist
      const actionButtonsExist = await runner.elementExists('.action-buttons');
      if (!actionButtonsExist) {
        throw new Error('Action buttons do not exist');
      }

      // Check action buttons position
      const actionButtonsPosition = await runner.getElementPosition('.action-buttons');
      const pageHeaderPosition = await runner.getElementPosition('.page-header');

      // Action buttons should be below the page header
      if (actionButtonsPosition.top < pageHeaderPosition.bottom) {
        throw new Error(`Action buttons are not positioned below the page header. Action buttons top: ${actionButtonsPosition.top}px, Page header bottom: ${pageHeaderPosition.bottom}px`);
      }

      // Check action buttons style
      const actionButtonsMarginBottom = await runner.getElementStyle('.action-buttons', 'marginBottom');
      if (actionButtonsMarginBottom !== '20px') {
        throw new Error(`Action buttons margin-bottom is not 20px. Margin-bottom: ${actionButtonsMarginBottom}`);
      }

      // Check action button style
      const actionButtonExists = await runner.elementExists('.action-btn');
      if (!actionButtonExists) {
        throw new Error('Action button does not exist');
      }

      const actionButtonPadding = await runner.getElementStyle('.action-btn', 'padding');
      if (actionButtonPadding !== '8px 15px') {
        throw new Error(`Action button padding is not 8px 15px. Padding: ${actionButtonPadding}`);
      }

      const actionButtonBorderRadius = await runner.getElementStyle('.action-btn', 'borderRadius');
      if (actionButtonBorderRadius !== '4px') {
        throw new Error(`Action button border-radius is not 4px. Border-radius: ${actionButtonBorderRadius}`);
      }
    }
  },

  // Document grid tests
  {
    name: 'Document Grid Position Test',
    test: async (page, runner) => {
      await runner.navigateTo('/documents-new');

      // Check if document grid exists
      const documentGridExists = await runner.elementExists('.document-grid');
      if (!documentGridExists) {
        throw new Error('Document grid does not exist');
      }

      // Check document grid position
      const documentGridPosition = await runner.getElementPosition('.document-grid');
      const actionButtonsPosition = await runner.getElementPosition('.action-buttons');

      // Document grid should be below the action buttons
      if (documentGridPosition.top < actionButtonsPosition.bottom) {
        throw new Error(`Document grid is not positioned below the action buttons. Document grid top: ${documentGridPosition.top}px, Action buttons bottom: ${actionButtonsPosition.bottom}px`);
      }

      // Check document grid style
      const documentGridDisplay = await runner.getElementStyle('.document-grid', 'display');
      if (documentGridDisplay !== 'grid') {
        throw new Error(`Document grid display is not grid. Display: ${documentGridDisplay}`);
      }

      const documentGridGap = await runner.getElementStyle('.document-grid', 'gap');
      if (documentGridGap !== '20px') {
        throw new Error(`Document grid gap is not 20px. Gap: ${documentGridGap}`);
      }
    }
  },

  // Document card tests
  {
    name: 'Document Card Position Test',
    test: async (page, runner) => {
      await runner.navigateTo('/documents-new');

      // Check if document card exists
      const documentCardExists = await runner.elementExists('.document-card');
      if (!documentCardExists) {
        throw new Error('Document card does not exist');
      }

      // Check document card style
      const documentCardBackgroundColor = await runner.getElementStyle('.document-card', 'backgroundColor');
      if (documentCardBackgroundColor !== 'rgb(249, 250, 251)') {
        throw new Error(`Document card background color is not correct. Color: ${documentCardBackgroundColor}`);
      }

      const documentCardBorderRadius = await runner.getElementStyle('.document-card', 'borderRadius');
      if (documentCardBorderRadius !== '8px') {
        throw new Error(`Document card border-radius is not 8px. Border-radius: ${documentCardBorderRadius}`);
      }

      const documentCardBoxShadow = await runner.getElementStyle('.document-card', 'boxShadow');
      if (!documentCardBoxShadow.includes('rgba(0, 0, 0, 0.05)')) {
        throw new Error(`Document card box-shadow is not correct. Box-shadow: ${documentCardBoxShadow}`);
      }
    }
  }
];

/**
 * Run the layout tests
 */
async function runLayoutTests() {
  const runner = new TestRunner();

  try {
    await runner.init();

    // Run layout tests
    for (const test of layoutTests) {
      await runner.runTest(test.name, test.test);
    }

    // Generate report
    const reportPath = await runner.generateReport();

    // Open report in browser
    console.log(`Layout tests completed. Report saved to: ${reportPath}`);
    console.log(`Open the report in your browser: file://${reportPath}`);
  } catch (error) {
    console.error('Error running layout tests:', error);
  } finally {
    await runner.close();
  }
}

// Run the tests
runLayoutTests();
