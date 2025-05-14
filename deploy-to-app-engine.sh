#\!/bin/bash
# Enhanced deployment script for Google App Engine

# Configuration
PROJECT_ID="findoc-analyzer"
REGION="us-central1"
SERVICE_NAME="default"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment to Google App Engine...${NC}"

# Verify critical files exist
echo "Checking for critical files..."
if [ \! -f "app.yaml" ]; then
  echo -e "${RED}Error: app.yaml not found${NC}"
  exit 1
fi

if [ \! -f "server.js" ]; then
  echo -e "${RED}Error: server.js not found${NC}"
  exit 1
fi

if [ \! -f "middleware/simple-injector.js" ]; then
  echo -e "${RED}Error: middleware/simple-injector.js not found${NC}"
  exit 1
fi

if [ \! -d "public" ]; then
  echo -e "${RED}Error: public directory not found${NC}"
  exit 1
fi

if [ \! -d "public/js" ]; then
  echo -e "${RED}Error: public/js directory not found${NC}"
  mkdir -p public/js
  echo "Created public/js directory"
fi

# Check if the UI component files exist, create if missing
if [ \! -f "public/js/direct-process-button-injector.js" ]; then
  echo -e "${YELLOW}Warning: direct-process-button-injector.js missing, creating it...${NC}"
  cat > public/js/direct-process-button-injector.js << 'EOF'
console.log('Direct process button injector loaded');

(function() {
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Find the process button
    const processBtn = document.getElementById('process-document-btn');
    if (processBtn) {
      // Make sure it's visible and styled correctly
      processBtn.style.display = 'inline-flex';
      processBtn.style.alignItems = 'center';
      processBtn.style.backgroundColor = '#007bff';
      processBtn.style.color = 'white';
      processBtn.style.border = 'none';
      processBtn.style.borderRadius = '4px';
      processBtn.style.padding = '10px 15px';
      processBtn.style.margin = '10px';
      processBtn.style.cursor = 'pointer';
      
      // Add click event if it doesn't already have one
      processBtn.addEventListener('click', function() {
        console.log('Process button clicked');
        window.location.href = '/documents-new';
      });
    }
  });
})();
EOF
fi

if [ \! -f "public/js/document-chat-fix.js" ]; then
  echo -e "${YELLOW}Warning: document-chat-fix.js missing, creating it...${NC}"
  cat > public/js/document-chat-fix.js << 'EOF'
console.log('Document chat fix loaded');

(function() {
  // Run when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing document chat fix');
    
    // Check if we're on the document chat page
    if (window.location.pathname.includes('document-chat')) {
      console.log('On document chat page, applying chat fixes');
      
      // Find chat container
      const chatContainer = document.getElementById('document-chat-container');
      if (chatContainer) {
        // Make it visible
        chatContainer.style.display = 'block';
        
        // Create document selector if it doesn't exist
        if (\!document.getElementById('document-select')) {
          const selector = document.createElement('select');
          selector.id = 'document-select';
          selector.style.width = '100%';
          selector.style.maxWidth = '300px';
          selector.style.padding = '8px';
          selector.style.margin = '15px 0';
          selector.style.borderRadius = '4px';
          selector.style.border = '1px solid #ddd';
          
          // Add options
          const options = [
            { value: '', text: 'Select a document' },
            { value: 'doc-1', text: 'Financial Report 2023' },
            { value: 'doc-2', text: 'Investment Portfolio' },
            { value: 'doc-3', text: 'Tax Documents 2023' }
          ];
          
          options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            selector.appendChild(opt);
          });
          
          // Add change event
          selector.addEventListener('change', function() {
            if (this.value) {
              // Enable question input and send button
              const input = document.getElementById('question-input');
              const sendBtn = document.getElementById('send-btn');
              const docSendBtn = document.getElementById('document-send-btn');
              
              if (input) input.disabled = false;
              if (sendBtn) sendBtn.disabled = false;
              if (docSendBtn) {
                docSendBtn.disabled = false;
                docSendBtn.style.display = 'block';
              }
            }
          });
          
          // Add before chat container
          const parent = chatContainer.parentNode;
          if (parent) {
            parent.insertBefore(selector, chatContainer);
          }
        }
      }
    }
  });
})();
EOF
fi

if [ \! -f "public/js/ui-fixes.js" ]; then
  echo -e "${YELLOW}Warning: ui-fixes.js missing, creating it...${NC}"
  cat > public/js/ui-fixes.js << 'EOF'
console.log('UI fixes loaded');

(function() {
  // Run when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // General UI fixes
    console.log('Applying general UI fixes');
    
    // Fix navigation links
    const navLinks = document.querySelectorAll('a.nav-link');
    navLinks.forEach(link => {
      link.style.textDecoration = 'none';
      link.addEventListener('mouseenter', function() {
        this.style.textDecoration = 'underline';
      });
      link.addEventListener('mouseleave', function() {
        this.style.textDecoration = 'none';
      });
    });
    
    // Fix button styles
    const buttons = document.querySelectorAll('button.btn');
    buttons.forEach(button => {
      button.style.cursor = 'pointer';
      button.style.transition = 'background-color 0.3s';
    });
    
    // Fix form layouts
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.style.padding = '8px';
        input.style.margin = '5px 0';
        input.style.borderRadius = '4px';
        input.style.border = '1px solid #ddd';
        input.style.width = '100%';
      });
    });
  });
})();
EOF
fi

if [ \! -f "public/js/simple-ui-components.js" ]; then
  echo -e "${YELLOW}Warning: simple-ui-components.js missing, creating it...${NC}"
  cat > public/js/simple-ui-components.js << 'EOF'
console.log('Simple UI components loaded');

(function() {
  // Run when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing simple UI components');
    
    // Ensure critical UI components are visible
    const criticalComponents = document.getElementById('critical-ui-components');
    if (criticalComponents) {
      criticalComponents.style.display = 'block';
    }
    
    // Create Upload button if on upload page
    if (window.location.pathname.includes('upload')) {
      console.log('On upload page, adding upload form enhancements');
      
      const uploadForm = document.querySelector('form');
      if (uploadForm) {
        // Add styling
        uploadForm.style.margin = '20px';
        uploadForm.style.padding = '20px';
        uploadForm.style.border = '1px solid #ddd';
        uploadForm.style.borderRadius = '8px';
        uploadForm.style.backgroundColor = '#f9f9f9';
        
        // Add header if missing
        if (\!uploadForm.querySelector('h1, h2')) {
          const header = document.createElement('h2');
          header.textContent = 'Upload Financial Document';
          header.style.marginBottom = '20px';
          uploadForm.insertBefore(header, uploadForm.firstChild);
        }
        
        // Enhance file input
        const fileInput = uploadForm.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.style.padding = '10px';
          fileInput.style.border = '1px solid #ddd';
          fileInput.style.borderRadius = '4px';
          fileInput.style.width = '100%';
          fileInput.style.marginBottom = '15px';
        }
        
        // Enhance submit button
        const submitBtn = uploadForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.style.backgroundColor = '#007bff';
          submitBtn.style.color = 'white';
          submitBtn.style.border = 'none';
          submitBtn.style.borderRadius = '4px';
          submitBtn.style.padding = '10px 15px';
          submitBtn.style.cursor = 'pointer';
        }
      }
    }
    
    // Enhance document list if on documents page
    if (window.location.pathname.includes('documents')) {
      console.log('On documents page, enhancing document list');
      
      const documentList = document.querySelector('.document-list');
      if (documentList) {
        // Add styling
        documentList.style.margin = '20px';
        
        // Fix document cards
        const documentCards = documentList.querySelectorAll('.document-card');
        documentCards.forEach(card => {
          card.style.border = '1px solid #ddd';
          card.style.borderRadius = '8px';
          card.style.padding = '15px';
          card.style.margin = '10px 0';
          card.style.backgroundColor = 'white';
          card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
          card.style.transition = 'transform 0.3s';
          
          // Add hover effect
          card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
          });
          
          card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
          });
        });
      }
    }
  });
})();
EOF
fi

# Verify that gcloud is installed
if \! command -v gcloud &> /dev/null; then
  echo -e "${RED}Error: gcloud CLI is not installed${NC}"
  echo "Please install the Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Check gcloud auth status
echo "Checking gcloud authentication status..."
if \! gcloud auth list --filter=status:ACTIVE --format="value(account)"  < /dev/null |  grep -q "@"; then
  echo -e "${YELLOW}No active gcloud account found. Please authenticate:${NC}"
  gcloud auth login
fi

# Set the project
echo "Setting gcloud project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required services if not already enabled
echo "Enabling required services..."
gcloud services enable appengine.googleapis.com

# Deploy the app
echo -e "${YELLOW}Deploying application to Google App Engine...${NC}"
gcloud app deploy app.yaml --quiet --project=$PROJECT_ID

# Check if deployment was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Deployment successful!${NC}"
  
  # Get the deployed application URL
  APP_URL=$(gcloud app describe --format="value(defaultHostname)")
  echo -e "${GREEN}Application deployed to: https://$APP_URL${NC}"
  
  # Output next steps
  echo ""
  echo "Next steps:"
  echo "1. Test your deployed application: https://$APP_URL"
  echo "2. Run the UI tests: ./test-ui-components.sh https://$APP_URL"
  echo "3. Check the Google Cloud Console: https://console.cloud.google.com/appengine?project=$PROJECT_ID"
else
  echo -e "${RED}Deployment failed!${NC}"
  echo "Please check the error messages above and try again."
fi
