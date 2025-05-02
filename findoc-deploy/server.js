const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 8080;

// Serve static files
app.use("/static", express.static(path.join(__dirname, "static")));

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "FinDoc Analyzer API is running" });
});

// Create a simple HTML file that loads the FinDoc UI
const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FinDoc Analyzer</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        #root {
            min-height: 100vh;
        }
    </style>
    <script src="/static/findoc-ui.js" defer></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>
`;

// Write the index.html file
fs.writeFileSync(path.join(__dirname, "static", "index.html"), indexHtml);

// Serve the main HTML file for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`FinDoc Analyzer server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
