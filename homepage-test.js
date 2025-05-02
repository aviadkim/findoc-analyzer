/**
 * FinDoc Analyzer Homepage Test
 *
 * This script tests the homepage of the FinDoc Analyzer application.
 */

const { MicroTestRunner } = require('./micro-test-framework');
const path = require('path');

/**
 * Run the homepage test
 */
async function runHomepageTest() {
  const runner = new MicroTestRunner();

  try {
    await runner.init();

    // Test 1: Homepage loads
    await runner.runTest('Homepage Loads', async (runner) => {
      await runner.navigateTo('/');

      // Check if the page title contains "FinDoc"
      const title = await runner.page.title();
      if (!title.includes('FinDoc')) {
        throw new Error(`Page title does not contain "FinDoc": ${title}`);
      }

      // Check if the sidebar exists
      const sidebarExists = await runner.elementExists('.sidebar');
      if (!sidebarExists) {
        throw new Error('Sidebar not found on homepage');
      }

      // Check if the main content exists
      const mainContentExists = await runner.elementExists('.main-content');
      if (!mainContentExists) {
        throw new Error('Main content not found on homepage');
      }
    });

    // Test 2: Sidebar navigation links
    await runner.runTest('Sidebar Navigation Links', async (runner) => {
      await runner.navigateTo('/');

      // Check if the sidebar navigation exists
      const sidebarNavExists = await runner.elementExists('.sidebar-nav');
      if (!sidebarNavExists) {
        throw new Error('Sidebar navigation not found on homepage');
      }

      // Get all navigation links
      const navLinks = await runner.page.$$('.sidebar-nav a');
      console.log(`Found ${navLinks.length} navigation links`);

      if (navLinks.length === 0) {
        throw new Error('No navigation links found in sidebar');
      }

      // Check each navigation link
      for (const link of navLinks) {
        const href = await runner.page.evaluate(el => el.getAttribute('href'), link);
        const text = await runner.page.evaluate(el => el.innerText.trim(), link);

        console.log(`Navigation link: ${text} (${href})`);

        if (!href || href === '#') {
          throw new Error(`Navigation link "${text}" has invalid href: ${href}`);
        }
      }
    });

    // Test 3: Click on Documents link
    await runner.runTest('Click on Documents Link', async (runner) => {
      await runner.navigateTo('/');

      // Find the Documents link
      const documentsLinkExists = await runner.elementExists('.sidebar-nav a[href*="documents"]');
      if (!documentsLinkExists) {
        throw new Error('Documents link not found in sidebar');
      }

      // Click on the Documents link
      await runner.clickElement('.sidebar-nav a[href*="documents"]');

      // Check if we navigated to the documents page
      const url = runner.page.url();
      if (!url.includes('documents')) {
        throw new Error(`Navigation to documents page failed. Current URL: ${url}`);
      }

      // Check if the documents page content exists
      const documentsPageExists = await runner.elementExists('.documents-page, .document-grid');
      if (!documentsPageExists) {
        throw new Error('Documents page content not found');
      }
    });

    // Test 4: Click on Upload link or button
    await runner.runTest('Click on Upload Link or Button', async (runner) => {
      await runner.navigateTo('/');

      // Try to find an upload link or button
      const uploadLinkExists = await runner.elementExists('a[href="/upload"]');

      if (!uploadLinkExists) {
        // Navigate to documents page to find upload button
        await runner.navigateTo('/documents-new');

        const uploadButtonExists = await runner.elementExists('a[href="/upload"]');
        if (!uploadButtonExists) {
          throw new Error('Upload button not found on documents page');
        }

        // Click on the upload button
        await runner.clickElement('a[href="/upload"]');
      } else {
        // Click on the upload link
        await runner.clickElement('a[href="/upload"]');
      }

      // Check if we navigated to the upload page
      const url = runner.page.url();
      if (!url.includes('upload')) {
        throw new Error(`Navigation to upload page failed. Current URL: ${url}`);
      }

      // Check if the upload page content exists
      const uploadPageExists = await runner.elementExists('.upload-area, input[type="file"], #file-input');
      if (!uploadPageExists) {
        throw new Error('Upload page content not found');
      }
    });

    // Generate report
    const reportPath = await runner.generateReport();
    console.log(`Test report saved to: ${reportPath}`);

    return reportPath;
  } finally {
    await runner.close();
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  runHomepageTest()
    .then(reportPath => {
      console.log(`Homepage test completed. Report saved to: ${reportPath}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Homepage test failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runHomepageTest
};
