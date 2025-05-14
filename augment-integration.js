// augment-integration.js - Main script for Augment AI to validate deployed interfaces
const { validateInterface } = require('./ui-validator');
const fs = require('fs');

// Expected UI elements from Augment AI's model for FinDoc Analyzer
const expectedElements = [
  // Document Processing Elements
  {
    description: "Process Document Button",
    selector: "#process-document-btn",
    location: "document detail page"
  },
  {
    description: "Reprocess Document Button",
    selector: "#reprocess-document-btn",
    location: "document detail page"
  },
  {
    description: "Download Document Button",
    selector: "#download-document-btn",
    location: "document detail page"
  },
  {
    description: "Processing Status Indicator",
    selector: "#processing-status",
    location: "document detail page"
  },
  {
    description: "Processing Progress Bar",
    selector: "#processing-progress-bar",
    location: "document detail page"
  },

  // Document Chat Elements
  {
    description: "Document Selector",
    selector: "#document-select",
    location: "document chat page"
  },
  {
    description: "Document Chat Container",
    selector: "#document-chat-container",
    location: "document chat page"
  },
  {
    description: "Document Chat Input",
    selector: "#document-chat-input",
    location: "document chat page"
  },
  {
    description: "Document Chat Send Button",
    selector: "#document-send-btn",
    location: "document chat page"
  },
  {
    description: "Document Chat Messages",
    selector: "#document-chat-messages",
    location: "document chat page"
  },

  // Authentication Elements
  {
    description: "Login Form",
    selector: "#login-form",
    location: "login page"
  },
  {
    description: "Register Form",
    selector: "#register-form",
    location: "signup page"
  },
  {
    description: "Google Login Button",
    selector: "#google-login-btn",
    location: "login and signup pages"
  },
  {
    description: "Auth Error Display",
    selector: "#auth-error",
    location: "login and signup pages"
  },
  {
    description: "User Navigation",
    selector: "#user-nav",
    location: "header"
  },

  // Agent Management Elements
  {
    description: "Agent Cards",
    selector: ".agent-card",
    location: "test page"
  },
  {
    description: "Agent Status Indicators",
    selector: ".status-indicator",
    location: "agent cards"
  },
  {
    description: "Agent Action Buttons",
    selector: ".agent-action",
    location: "agent cards"
  },
  {
    description: "Agent Notification",
    selector: "#agent-notification",
    location: "global"
  },

  // Navigation Elements
  {
    description: "Sidebar",
    selector: ".sidebar",
    location: "left side of page"
  },
  {
    description: "Main Content",
    selector: ".main-content",
    location: "right side of page"
  },
  {
    description: "Notification",
    selector: "#notification",
    location: "global"
  }
];

// Function to run validation
async function runValidation() {
  try {
    // Get deployment URL from Google Cloud or use local server
    const baseUrl = process.env.DEPLOYMENT_URL || 'http://localhost:8080';

    // Define pages to validate
    const pagesToValidate = [
      { path: '/', name: 'Home Page' },
      { path: '/documents-new', name: 'Documents Page' },
      { path: '/document-chat', name: 'Document Chat Page' },
      { path: '/upload', name: 'Upload Page' },
      { path: '/login', name: 'Login Page' },
      { path: '/signup', name: 'Signup Page' }
    ];

    // Create validation report directory
    const reportDir = './validation-reports';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }

    // Validate each page
    const allResults = {};
    let totalMissingElements = 0;

    for (const page of pagesToValidate) {
      console.log(`\nValidating ${page.name} at ${baseUrl}${page.path}...`);

      // Run validation for this page
      const pageUrl = `${baseUrl}${page.path}`;
      const validationResult = await validateInterface(pageUrl, expectedElements);

      // Add to all results
      allResults[page.name] = validationResult;
      totalMissingElements += validationResult.missingElements.length;

      // Write individual page report
      const reportFile = `${reportDir}/${page.name.toLowerCase().replace(/\s+/g, '-')}-validation.json`;
      fs.writeFileSync(reportFile, JSON.stringify(validationResult, null, 2));

      // Log page summary
      console.log(`${page.name} Validation: ${validationResult.missingElements.length} missing elements found`);
    }

    // Write combined report
    const combinedReport = {
      timestamp: new Date().toISOString(),
      baseUrl: baseUrl,
      pagesValidated: pagesToValidate.length,
      totalMissingElements: totalMissingElements,
      pageResults: allResults
    };

    fs.writeFileSync(`${reportDir}/combined-validation-report.json`, JSON.stringify(combinedReport, null, 2));

    // Log overall summary
    console.log(`\nValidation Complete: ${totalMissingElements} missing elements found across ${pagesToValidate.length} pages`);

    if (totalMissingElements > 0) {
      console.log('\nMissing Elements by Page:');

      for (const page of pagesToValidate) {
        const pageResult = allResults[page.name];
        if (pageResult.missingElements.length > 0) {
          console.log(`\n${page.name} (${pageResult.missingElements.length} missing):`);

          pageResult.missingElements.forEach(element => {
            console.log(`- ${element.element} (expected at ${element.expectedLocation})`);
          });
        }
      }

      // Generate remediation suggestions
      console.log('\nRemediation Suggestions:');
      for (const page of pagesToValidate) {
        const pageResult = allResults[page.name];
        if (pageResult.missingElements.length > 0) {
          console.log(`\nFor ${page.name}:`);

          pageResult.missingElements.forEach(element => {
            console.log(`- Add the missing "${element.element}" with selector "${element.selector}" to the ${element.expectedLocation}`);
          });
        }
      }
    } else {
      console.log('All UI elements are correctly implemented across all pages!');
    }

    return combinedReport;
  } catch (error) {
    console.error('Validation failed:', error);
    throw error;
  }
}

// Run if directly invoked
if (require.main === module) {
  runValidation()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runValidation };
