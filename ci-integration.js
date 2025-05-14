// ci-integration.js - Script to run as part of CI/CD pipeline
const { runValidation } = require('./augment-integration');

async function ciValidation() {
  try {
    console.log('Starting UI validation as part of CI/CD pipeline...');

    const result = await runValidation();

    // Fail the build if there are missing elements
    if (result.totalMissingElements > 0) {
      console.error(`Build failed: ${result.totalMissingElements} UI elements are missing across ${result.pagesValidated} pages`);

      // Log critical missing elements
      const criticalElements = [
        "#process-document-btn",
        "#document-chat-container",
        "#document-send-btn",
        "#login-form",
        "#google-login-btn"
      ];

      let criticalMissing = false;

      // Check each page for critical missing elements
      Object.keys(result.pageResults).forEach(pageName => {
        const pageResult = result.pageResults[pageName];

        const missingCritical = pageResult.missingElements.filter(element =>
          criticalElements.includes(element.selector)
        );

        if (missingCritical.length > 0) {
          console.error(`\nCritical elements missing in ${pageName}:`);
          missingCritical.forEach(element => {
            console.error(`- ${element.element} (${element.selector})`);
          });
          criticalMissing = true;
        }
      });

      // Only fail the build if critical elements are missing
      if (criticalMissing) {
        console.error('\nBuild failed due to missing critical UI elements');
        process.exit(1);
      } else {
        console.warn('\nWarning: Some non-critical UI elements are missing, but allowing build to proceed');
        console.warn('Please fix these issues in a follow-up commit');
        process.exit(0);
      }
    } else {
      console.log('UI validation passed! All elements are present.');
      process.exit(0);
    }
  } catch (error) {
    console.error('CI validation failed:', error);
    process.exit(1);
  }
}

ciValidation();
