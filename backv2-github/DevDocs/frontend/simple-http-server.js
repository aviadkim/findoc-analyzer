const http = require('http');
const PORT = 3002;

// Create HTML content as a string
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>FinDocs Pro</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            min-height: 100vh;
            background-color: #f7f9fc;
        }
        
        /* Left sidebar navigation */
        .left-sidebar {
            width: 180px;
            background-color: #1e293b;
            color: white;
            height: 100vh;
            position: fixed;
            left: 0;
            top: 0;
            display: flex;
            flex-direction: column;
            z-index: 100;
        }

        .app-logo {
            padding: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            font-size: 18px;
            font-weight: bold;
            text-align: center;
        }

        .nav-items {
            padding: 20px 0;
        }

        .nav-item {
            padding: 10px 20px;
            display: flex;
            align-items: center;
            color: #e2e8f0;
            text-decoration: none;
            transition: background-color 0.2s;
        }

        .nav-item:hover, .nav-item.active {
            background-color: #334155;
        }

        .nav-item.active {
            border-left: 3px solid #3b82f6;
        }

        .nav-item i {
            margin-right: 10px;
            width: 20px;
            text-align: center;
        }

        /* Main content area */
        .main-container {
            margin-left: 180px;
            padding: 20px;
            background-color: #f8fafc;
            min-height: 100vh;
        }

        /* Top navigation */
        .top-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background-color: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 20px;
        }

        .page-header {
            font-size: 24px;
            font-weight: bold;
            color: #1e293b;
        }

        .user-profile {
            display: flex;
            align-items: center;
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #3b82f6;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-left: 15px;
        }

        /* Dashboard content */
        .dashboard-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }

        .dashboard-card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 20px;
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background-color: #3b82f6;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .welcome-section {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .welcome-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 10px;
        }

        .welcome-text {
            color: #64748b;
            margin-bottom: 15px;
        }

        .action-buttons {
            display: flex;
            gap: 10px;
        }

        .btn {
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
        }

        .btn-primary {
            background-color: #3b82f6;
            color: white;
            border: none;
        }

        .btn-outline {
            background-color: transparent;
            color: #3b82f6;
            border: 1px solid #3b82f6;
        }

        .btn i {
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <!-- Left Sidebar -->
    <div class="left-sidebar">
        <div class="app-logo">FinDocs Pro</div>
        <div class="nav-items">
            <a href="#" class="nav-item active">
                <i>🏠</i> Dashboard
            </a>
            <a href="#" class="nav-item">
                <i>📤</i> Upload Documents
            </a>
            <a href="#" class="nav-item">
                <i>📊</i> Analytics
            </a>
            <a href="#" class="nav-item">
                <i>📄</i> Reports
            </a>
            <a href="#" class="nav-item">
                <i>🧪</i> PDF Extraction
            </a>
            <a href="#" class="nav-item">
                <i>💰</i> Financial Analysis
            </a>
            <a href="#" class="nav-item">
                <i>🧪</i> Testing
            </a>
            <a href="#" class="nav-item">
                <i>⚙️</i> Dev Testing
            </a>
            <a href="#" class="nav-item">
                <i>🔌</i> MCP Demo
            </a>
            <a href="#" class="nav-item">
                <i>🧪</i> MCP Test
            </a>
            <a href="#" class="nav-item">
                <i>⚙️</i> Settings
            </a>
        </div>
    </div>

    <!-- Main Content -->
    <div class="main-container">
        <!-- Top Navigation -->
        <div class="top-nav">
            <div class="page-header">Dashboard</div>
            <div class="user-profile">
                <div class="user-avatar">AB</div>
            </div>
        </div>

        <!-- Welcome Section -->
        <div class="welcome-section">
            <div class="welcome-title">Welcome, Aviad</div>
            <div class="welcome-text">This is your financial document dashboard. Upload documents, analyze your portfolio, and get insights from your financial data.</div>
            <div class="action-buttons">
                <a href="#" class="btn btn-primary"><i>📤</i> Open Testing Dashboard</a>
                <a href="#" class="btn btn-outline"><i>⚙️</i> Configure API Keys</a>
            </div>
        </div>

        <!-- Dashboard Cards -->
        <div class="dashboard-container">
            <div class="dashboard-card">
                <div class="card-header">
                    <h3 class="card-title">Recent Documents</h3>
                    <div class="card-icon">📄</div>
                </div>
                <div class="card-content">
                    <p>You have 3 recently processed documents.</p>
                </div>
                <div class="card-footer">
                    <a href="#" class="card-link">View All Documents</a>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <h3 class="card-title">Portfolio Summary</h3>
                    <div class="card-icon">💼</div>
                </div>
                <div class="card-content">
                    <p>Total portfolio value: $19,510,599</p>
                </div>
                <div class="card-footer">
                    <a href="#" class="card-link">View Portfolio</a>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <h3 class="card-title">Document Analysis</h3>
                    <div class="card-icon">🔍</div>
                </div>
                <div class="card-content">
                    <p>Run analysis on your financial documents.</p>
                </div>
                <div class="card-footer">
                    <a href="#" class="card-link">Start Analysis</a>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <h3 class="card-title">Data Export</h3>
                    <div class="card-icon">📊</div>
                </div>
                <div class="card-content">
                    <p>Export your financial data in various formats.</p>
                </div>
                <div class="card-footer">
                    <a href="#" class="card-link">Export Data</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;

// Create a server
const server = http.createServer((req, res) => {
  // Set the response headers
  res.writeHead(200, { 'Content-Type': 'text/html' });
  
  // Send the HTML content
  res.end(htmlContent);
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
