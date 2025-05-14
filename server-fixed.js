/**
 * FinDoc Analyzer Server
 *
 * This is the main server file for the FinDoc Analyzer application.
 * It sets up the Express server, middleware, and routes.
 */

// Import required modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

// Create Express app
const app = express();
const port = process.env.PORT || 8080;

// Configure middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Simple UI injector middleware
const simpleInjectorMiddleware = (req, res, next) => {
  // Store original send function
  const originalSend = res.send;

  // Override send function
  res.send = function(body) {
    try {
      // Only modify HTML responses
      if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
        console.log(`Injecting UI components script into response for ${req.path}`);

        // Inject script before </body>
        const bodyEndPos = body.indexOf('</body>');
        if (bodyEndPos > 0) {
          // Check if we're on the upload page
          const isUploadPage = req.path.includes('/upload');

          let scriptTag = `
<script src="/js/simple-ui-components.js"></script>
<script>
  console.log('UI components script injected');
</script>
`;

          // If we're on the upload page, also inject the process button script
          if (isUploadPage) {
            scriptTag += `
<script src="/js/direct-process-button-injector.js"></script>
<script>
  console.log('Process button injector script injected');
</script>
`;
          }

          // If we're on the document chat page, inject the document chat fix script
          const isDocumentChatPage = req.path.includes('/document-chat');
          if (isDocumentChatPage) {
            scriptTag += `
<script src="/js/document-chat-fix.js"></script>
<script>
  console.log('Document chat fix script injected');
</script>
`;
          }

          body = body.substring(0, bodyEndPos) + scriptTag + body.substring(bodyEndPos);
          console.log(`Successfully injected UI components script into response for ${req.path}`);
        } else {
          console.warn(`Could not find </body> tag in response for ${req.path}`);
        }
      }
    } catch (error) {
      console.error(`Error injecting UI components script: ${error.message}`);
    }

    // Call original send function
    return originalSend.call(this, body);
  };

  // Continue to next middleware
  next();
};

// Apply simple injector middleware
app.use(simpleInjectorMiddleware);

// Define routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Document routes
app.get('/documents-new', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'documents-new.html'));
});

app.get('/document-chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'document-chat.html'));
});

app.get('/document-comparison', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'document-comparison.html'));
});

// Analytics routes
app.get('/analytics-new', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'analytics-new.html'));
});

// Upload routes
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.get('/upload-new', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload-new.html'));
});

// Auth routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Test routes
app.get('/api-key-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-key-test.html'));
});

app.get('/agent-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'agent-test.html'));
});

app.get('/messos-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'messos-test.html'));
});

app.get('/messos-agent-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'messos-agent-test.html'));
});

app.get('/agent-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'agent-demo.html'));
});

app.get('/user-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'user-dashboard.html'));
});

// Admin routes
app.get('/admin/subscription-management', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin/subscription-management.html'));
});

// API routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FinDoc Analyzer API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Document processing API
app.post('/api/documents/process/:id', (req, res) => {
  const documentId = req.params.id;

  console.log(`Processing document with ID: ${documentId}`);

  // Simulate processing
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Document processing started',
      documentId,
      status: 'processing'
    });
  }, 1000);
});

// Document status API
app.get('/api/documents/status/:id', (req, res) => {
  const documentId = req.params.id;

  console.log(`Getting status for document with ID: ${documentId}`);

  // Simulate status check
  res.json({
    success: true,
    documentId,
    status: 'processed',
    lastUpdated: new Date().toISOString()
  });
});

// Document chat API
app.post('/api/documents/chat/:id', (req, res) => {
  const documentId = req.params.id;
  const { message } = req.body;

  console.log(`Chat message for document ${documentId}: ${message}`);

  // Simulate chat response
  setTimeout(() => {
    res.json({
      success: true,
      documentId,
      message,
      response: `This is a response to your message: "${message}" about document ${documentId}`,
      timestamp: new Date().toISOString()
    });
  }, 1000);
});

// Catch-all route for HTML pages
app.get('*', (req, res) => {
  // Check if the requested path exists as an HTML file
  const htmlPath = path.join(__dirname, 'public', req.path + '.html');

  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    // If not, send the index.html file
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// Start the server
app.listen(port, () => {
  console.log(`FinDoc Analyzer server running on port ${port}`);
  console.log(`Server started at: ${new Date().toISOString()}`);
  console.log(`Server URL: http://localhost:${port}`);
});
