const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

// Serve static files
app.use("/static", express.static(path.join(__dirname, "static")));

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "FinDoc Analyzer API is running" });
});

// Serve the main HTML file for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`FinDoc Analyzer server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
