const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: './frontend' });
const handle = app.getRequestHandler();
const port = process.env.PORT || 8080;

app.prepare().then(() => {
  const server = express();

  // API routes
  server.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'FinDoc Analyzer API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Let Next.js handle all other routes
  server.all('*', (req, res) => {
    const parsedUrl = parse(req.url, true);
    return handle(req, res, parsedUrl);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV}`);
  });
});
