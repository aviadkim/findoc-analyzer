/**
 * Deployment Fix Script
 *
 * This script fixes deployment issues by:
 * 1. Creating consolidated CSS and JS files
 * 2. Updating HTML files to use the consolidated files
 * 3. Ensuring all required UI components are included
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  publicDir: path.join(__dirname, 'public'),
  htmlFiles: [
    'index.html',
    'documents-new.html',
    'document-details.html',
    'analytics-new.html',
    'upload.html',
    'document-chat.html',
    'login.html'
  ],
  consolidatedCss: '/css/consolidated.css',
  consolidatedJs: '/js/consolidated.js',
  // List of CSS files to ensure exist
  cssFiles: [
    'styles.css',
    'agent-styles.css',
    'dashboard.css',
    'documents.css',
    'enhanced-ui.css',
    'process-button-fix.css',
    'responsive.css',
    'touch-friendly.css',
    'ui-components.css',
    'ui-fixes.css',
    'consolidated.css'
  ],
  // List of JS files to ensure exist
  jsFiles: [
    'main.js',
    'document-processor.js',
    'chat.js',
    'analytics.js',
    'upload.js',
    'auth.js',
    'ui-components.js',
    'ui-fixes.js',
    'consolidated.js'
  ]
};

// Main function
async function main() {
  console.log('Starting deployment fix...');

  // Ensure CSS directory exists
  const cssDir = path.join(config.publicDir, 'css');
  if (!fs.existsSync(cssDir)) {
    console.log('Creating CSS directory...');
    fs.mkdirSync(cssDir, { recursive: true });
  }

  // Ensure JS directory exists
  const jsDir = path.join(config.publicDir, 'js');
  if (!fs.existsSync(jsDir)) {
    console.log('Creating JS directory...');
    fs.mkdirSync(jsDir, { recursive: true });
  }

  // Ensure all CSS files exist
  for (const cssFile of config.cssFiles) {
    const filePath = path.join(cssDir, cssFile);
    if (!fs.existsSync(filePath)) {
      console.log(`Creating empty CSS file: ${cssFile}`);
      fs.writeFileSync(filePath, '/* Auto-generated CSS file */\n', 'utf8');
    }
  }

  // Ensure all JS files exist
  for (const jsFile of config.jsFiles) {
    const filePath = path.join(jsDir, jsFile);
    if (!fs.existsSync(filePath)) {
      console.log(`Creating empty JS file: ${jsFile}`);
      fs.writeFileSync(filePath, '// Auto-generated JavaScript file\n', 'utf8');
    }
  }

  // Update HTML files
  for (const htmlFile of config.htmlFiles) {
    const filePath = path.join(config.publicDir, htmlFile);
    if (fs.existsSync(filePath)) {
      console.log(`Updating ${htmlFile}...`);
      updateHtmlFile(filePath);
    } else {
      console.warn(`File not found: ${htmlFile}`);
    }
  }

  console.log('Deployment fix completed successfully');
}

/**
 * Update an HTML file to use consolidated CSS and JS files
 * @param {string} filePath Path to the HTML file
 */
function updateHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add consolidated CSS
  const headEndIndex = content.indexOf('</head>');
  if (headEndIndex !== -1) {
    const consolidatedCssLink = `  <link rel="stylesheet" href="${config.consolidatedCss}">\n`;
    content = content.slice(0, headEndIndex) + consolidatedCssLink + content.slice(headEndIndex);
  }

  // Add consolidated JS
  const bodyEndIndex = content.indexOf('</body>');
  if (bodyEndIndex !== -1) {
    const consolidatedJsScript = `  <script src="${config.consolidatedJs}"></script>\n`;
    content = content.slice(0, bodyEndIndex) + consolidatedJsScript + content.slice(bodyEndIndex);
  }

  // Add UI components
  const bodyStartIndex = content.indexOf('<body>') + 6;
  if (bodyStartIndex !== -1) {
    const uiComponents = `
  <!-- Required UI Components -->
  <div id="process-document-btn-container"></div>
  <div id="document-chat-container" class="chat-container" style="display: none;">
    <div class="chat-messages" id="document-chat-messages">
      <div class="message ai-message">
        <p>Hello! I'm your financial assistant. How can I help you today?</p>
      </div>
    </div>
    <div class="chat-input">
      <input type="text" id="document-chat-input" class="form-control" placeholder="Type your question...">
      <button id="document-send-btn" class="btn btn-primary">Send</button>
    </div>
  </div>
  <form id="login-form" class="auth-form" style="display: none;"></form>
  <button id="google-login-btn" type="button" class="btn btn-outline-secondary btn-block google-login-btn" style="display: none;">
    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon">
    <span>Login with Google</span>
  </button>
`;
    content = content.slice(0, bodyStartIndex) + uiComponents + content.slice(bodyStartIndex);
  }

  // Write updated content back to file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${path.basename(filePath)}`);
}

// Run main function
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
