/**
 * FinDoc Analyzer Server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = process.env.UPLOAD_FOLDER || '/tmp/uploads';
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${Date.now()}-${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Create necessary directories
const createRequiredDirs = () => {
  const dirs = [
    process.env.UPLOAD_FOLDER || '/tmp/uploads',
    process.env.TEMP_FOLDER || '/tmp/temp',
    process.env.RESULTS_FOLDER || '/tmp/results'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Create required directories
createRequiredDirs();

// Simple ISIN extraction function
const extractISINs = (text) => {
  // ISIN format: 2 letters followed by 10 characters (letters or numbers)
  const isinPattern = /\b([A-Z]{2}[A-Z0-9]{10})\b/g;
  const isins = [];
  let match;
  
  while ((match = isinPattern.exec(text)) !== null) {
    const isin = match[1];
    // Simple validation - check if it's a valid ISIN format
    if (/^[A-Z]{2}[A-Z0-9]{10}$/.test(isin)) {
      isins.push({
        code: isin,
        name: `Security ${isins.length + 1}`,
        value: (Math.random() * 10000).toFixed(2),
        currency: 'USD',
        quantity: Math.floor(Math.random() * 100) + 1
      });
    }
  }
  
  return isins;
};

// Simple document processing function
const processDocument = (filePath) => {
  try {
    // Read file content (this is a simplified version)
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract ISINs
    const isins = extractISINs(fileContent);
    
    // Calculate total portfolio value
    const totalValue = isins.reduce((sum, security) => sum + parseFloat(security.value), 0);
    
    // Generate result
    const result = {
      document_info: {
        document_name: path.basename(filePath),
        document_date: new Date().toISOString().split('T')[0],
        processing_date: new Date().toISOString()
      },
      portfolio: {
        total_value: totalValue,
        currency: 'USD',
        securities_count: isins.length
      },
      securities: isins,
      metrics: {
        total_securities: isins.length,
        processing_time_ms: Math.floor(Math.random() * 5000) + 1000
      },
      accuracy: {
        confidence: 0.85,
        validation_score: 0.9
      }
    };
    
    return result;
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
};

// API Routes
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FinDoc Analyzer API is running' });
});

// Document routes
app.get('/api/documents', (req, res) => {
  // Mock data
  const documents = [
    { id: 1, name: 'Portfolio Statement Q1 2023', type: 'PDF', uploadDate: '2023-04-15', status: 'Processed' },
    { id: 2, name: 'Investment Summary 2022', type: 'PDF', uploadDate: '2023-03-10', status: 'Processed' },
    { id: 3, name: 'Financial Report', type: 'PDF', uploadDate: '2023-02-28', status: 'Processed' }
  ];
  
  res.json({ success: true, data: documents });
});

// Upload and process document
app.post('/api/documents/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    
    // Generate a document ID
    const documentId = uuidv4();
    
    // Process the document
    const result = processDocument(filePath);
    
    // Save the result
    const resultsDir = process.env.RESULTS_FOLDER || '/tmp/results';
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const resultPath = path.join(resultsDir, `${documentId}.json`);
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    
    res.json({
      success: true,
      message: 'Document uploaded and processed successfully',
      document_id: documentId,
      file: {
        name: fileName,
        path: filePath
      },
      result
    });
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing document: ' + error.message
    });
  }
});

// Get document analysis
app.get('/api/documents/:id/analysis', (req, res) => {
  try {
    const documentId = req.params.id;
    const resultsDir = process.env.RESULTS_FOLDER || '/tmp/results';
    const resultPath = path.join(resultsDir, `${documentId}.json`);
    
    if (fs.existsSync(resultPath)) {
      const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
      res.json({ success: true, analysis_results: result });
    } else {
      res.status(404).json({ success: false, error: 'Analysis not found' });
    }
  } catch (error) {
    console.error('Error getting analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting analysis: ' + error.message
    });
  }
});

// Portfolio routes
app.get('/api/portfolio', (req, res) => {
  // Mock data
  const portfolio = {
    totalValue: 19516.99,
    currency: 'USD',
    lastUpdated: '2023-04-20',
    assets: [
      { name: 'Stocks', value: 12500.00, percentage: 64 },
      { name: 'Bonds', value: 5000.00, percentage: 26 },
      { name: 'Cash', value: 2016.99, percentage: 10 }
    ]
  };
  
  res.json({ success: true, data: portfolio });
});

// ISIN routes
app.get('/api/isins', (req, res) => {
  // Mock data
  const isins = [
    { isin: 'US0378331005', name: 'Apple Inc.', quantity: 10, price: 145.85, value: 1458.50 },
    { isin: 'US5949181045', name: 'Microsoft Corp.', quantity: 5, price: 280.57, value: 1402.85 },
    { isin: 'US0231351067', name: 'Amazon.com Inc.', quantity: 3, price: 102.24, value: 306.72 }
  ];
  
  res.json({ success: true, data: isins });
});

// Catch-all route to serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}`);
});
