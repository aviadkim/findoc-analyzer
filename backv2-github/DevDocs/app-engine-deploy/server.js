const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'static')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// API routes
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'FinDoc API is running' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Access the application at http://localhost:${port}`);
});
