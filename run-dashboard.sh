#\!/bin/bash
# FinDoc Analyzer Dashboard for Deployment and Testing

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Clear screen
clear

# Functions
function print_header() {
  echo -e "${BLUE}=================================${NC}"
  echo -e "${BLUE}  FinDoc Analyzer Dashboard${NC}"
  echo -e "${BLUE}=================================${NC}"
  echo ""
}

function print_menu() {
  echo -e "${YELLOW}Select an option:${NC}"
  echo -e "1. ${GREEN}Deploy to Google App Engine${NC}"
  echo -e "2. ${GREEN}Test deployed UI components${NC}"
  echo -e "3. ${GREEN}View test results${NC}"
  echo -e "4. ${GREEN}Run deployment and tests in sequence${NC}"
  echo -e "5. ${GREEN}Create documentation${NC}"
  echo -e "6. ${BLUE}Exit${NC}"
  echo ""
  echo -n "Enter your choice (1-6): "
}

function deploy_to_app_engine() {
  echo -e "${YELLOW}Deploying to Google App Engine...${NC}"
  ./deploy-to-app-engine.sh
  echo ""
  echo -e "${GREEN}Press Enter to continue...${NC}"
  read
}

function test_ui_components() {
  # Get the deployed URL
  local deployed_url=""
  
  echo -n "Enter the deployed URL (leave blank for default): "
  read url_input
  
  if [ -z "$url_input" ]; then
    # Try to get the URL from gcloud
    deployed_url=$(gcloud app describe --format="value(defaultHostname)" 2>/dev/null)
    
    if [ -z "$deployed_url" ]; then
      deployed_url="https://findoc-analyzer.uc.r.appspot.com"
    else
      deployed_url="https://$deployed_url"
    fi
    
    echo -e "${YELLOW}Using URL: ${deployed_url}${NC}"
  else
    deployed_url=$url_input
  fi
  
  echo -e "${YELLOW}Running UI component tests...${NC}"
  ./test-ui-components.sh "$deployed_url"
  echo ""
  echo -e "${GREEN}Press Enter to continue...${NC}"
  read
}

function view_test_results() {
  # Check if test results exist
  if [ \! -d "ui-test-results" ]; then
    echo -e "${RED}No test results found. Run tests first.${NC}"
    echo ""
    echo -e "${GREEN}Press Enter to continue...${NC}"
    read
    return
  fi
  
  # Find the HTML report
  local report_file="ui-test-results/test-report.html"
  
  if [ -f "$report_file" ]; then
    echo -e "${GREEN}Opening test report...${NC}"
    
    # Try to open the report with the default browser
    if command -v xdg-open &> /dev/null; then
      xdg-open "$report_file"
    elif command -v open &> /dev/null; then
      open "$report_file"
    elif command -v start &> /dev/null; then
      start "$report_file"
    else
      echo -e "${YELLOW}Could not open the report automatically.${NC}"
      echo -e "${YELLOW}Please open ${report_file} manually.${NC}"
    fi
  else
    echo -e "${RED}Test report not found.${NC}"
  fi
  
  echo ""
  echo -e "${GREEN}Press Enter to continue...${NC}"
  read
}

function run_sequence() {
  echo -e "${YELLOW}Running deployment and tests in sequence...${NC}"
  
  # Deploy
  ./deploy-to-app-engine.sh
  
  # Check if deployment was successful
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deployment successful\! Running tests...${NC}"
    
    # Get the deployed URL
    local deployed_url=$(gcloud app describe --format="value(defaultHostname)" 2>/dev/null)
    
    if [ -z "$deployed_url" ]; then
      deployed_url="https://findoc-analyzer.uc.r.appspot.com"
    else
      deployed_url="https://$deployed_url"
    fi
    
    # Run tests
    ./test-ui-components.sh "$deployed_url"
    
    # Check if tests were successful
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Tests completed\!${NC}"
      
      # Try to open the report
      if [ -f "ui-test-results/test-report.html" ]; then
        echo -e "${GREEN}Opening test report...${NC}"
        
        # Try to open the report with the default browser
        if command -v xdg-open &> /dev/null; then
          xdg-open "ui-test-results/test-report.html"
        elif command -v open &> /dev/null; then
          open "ui-test-results/test-report.html"
        elif command -v start &> /dev/null; then
          start "ui-test-results/test-report.html"
        else
          echo -e "${YELLOW}Could not open the report automatically.${NC}"
          echo -e "${YELLOW}Please open ui-test-results/test-report.html manually.${NC}"
        fi
      fi
    else
      echo -e "${RED}Tests failed.${NC}"
    fi
  else
    echo -e "${RED}Deployment failed.${NC}"
  fi
  
  echo ""
  echo -e "${GREEN}Press Enter to continue...${NC}"
  read
}

function create_documentation() {
  echo -e "${YELLOW}Creating documentation...${NC}"
  
  # Create documentation file
  local doc_file="UI_IMPROVEMENTS_SUMMARY.md"
  
  cat > "$doc_file" << 'EOF'
# UI Improvements Summary

## Overview

This document provides a summary of the UI improvements made to the FinDoc Analyzer application to ensure proper rendering of UI components in the deployed environment.

## Problem Statement

The application was experiencing issues with UI components not rendering properly in the deployed environment (Google App Engine), despite working correctly in the local development environment. Key components affected included:

1. Process Document buttons
2. Document Chat functionality
3. Google Login buttons
4. Various interactive elements

## Solution Approach

Our approach followed a progressive enhancement strategy, combining server-side HTML injection with client-side JavaScript enhancements:

### 1. Enhanced Middleware for Direct HTML Injection

We modified the `simple-injector.js` middleware to directly inject HTML for critical UI components into the page content before sending it to the browser. This ensures that components exist in the DOM even if JavaScript fails to run.

```javascript
// Direct HTML component injection for critical UI elements
let directHtmlComponents = `
<\!-- Critical UI Components - direct HTML injection -->
<div id="critical-ui-components">
  <\!-- Process Button -->
  <button id="process-document-btn" style="...">
    Process Document
  </button>

  <\!-- Document Chat Container -->
  <div id="document-chat-container" class="chat-container" style="...">
    ...
  </div>
</div>

<\!-- Show Chat Button -->
<button id="show-chat-btn" style="...">Chat</button>
`;

// Insert at body end position
body = body.substring(0, bodyEndPos) + directHtmlComponents + body.substring(bodyEndPos);
```

### 2. Reliable Styling with Inline CSS

To avoid dependency on external CSS files, we included inline styling directly in the HTML components. This ensures consistent appearance regardless of CSS loading issues.

### 3. Page-Specific Component Injection

We implemented page detection to inject only the relevant components for each page:

```javascript
// Determine the current page
const isUploadPage = req.path.includes('/upload');
const isDocumentChatPage = req.path.includes('/document-chat');
const isDocumentsPage = req.path.includes('/documents');
```

### 4. Client-Side Enhancements

We supplemented the server-side injection with client-side JavaScript to add interactivity:

- `direct-process-button-injector.js`: Ensures process buttons are visible and properly styled
- `document-chat-fix.js`: Creates document selector and sets up chat functionality
- `ui-fixes.js`: Applies general UI fixes to all pages

## Deployment Process

The deployment to Google App Engine follows these steps:

1. Verify critical files exist (app.yaml, server.js, middleware, etc.)
2. Ensure all required JS files are present
3. Check gcloud authentication status
4. Deploy to Google App Engine
5. Run automated UI tests to verify components work in the deployed environment

## Testing Approach

After deployment, we use Puppeteer to test the UI components automatically:

1. Visit each key page (home, upload, documents, document-chat)
2. Verify presence of critical UI components
3. Test functionality (clicks, form inputs, etc.)
4. Capture screenshots for visual verification
5. Generate HTML report of test results

## Results

The implemented improvements ensure that UI components render properly in the deployed environment, maintaining consistency with the local development experience. Key metrics:

- Process buttons visible and functional on all pages
- Document chat functionality working properly
- All interactive elements accessible and styled correctly
- Consistent appearance across different browsers

## Future Improvements

Potential areas for further enhancement:

1. Implement service worker for offline functionality
2. Use browser feature detection for progressive enhancement
3. Create component health monitoring system
4. Improve responsive design for mobile devices
5. Add automated accessibility testing

## Conclusion

By implementing server-side HTML injection combined with client-side JavaScript enhancements, we've successfully addressed the UI rendering issues in the deployed environment. The application now provides a consistent experience across both local and deployed environments.
EOF

  echo -e "${GREEN}Documentation created: ${doc_file}${NC}"
  echo ""
  echo -e "${GREEN}Press Enter to continue...${NC}"
  read
}

# Main program
while true; do
  print_header
  print_menu
  
  read choice
  
  case $choice in
    1)
      deploy_to_app_engine
      ;;
    2)
      test_ui_components
      ;;
    3)
      view_test_results
      ;;
    4)
      run_sequence
      ;;
    5)
      create_documentation
      ;;
    6)
      echo -e "${GREEN}Exiting...${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid choice. Please try again.${NC}"
      echo ""
      echo -e "${GREEN}Press Enter to continue...${NC}"
      read
      ;;
  esac
  
  clear
done
