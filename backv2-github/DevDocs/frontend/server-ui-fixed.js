const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3002;

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
        
        /* Sidebar Styles */
        .sidebar {
            width: 250px;
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
        
        .sidebar-header {
            padding: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .app-title {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        
        .sidebar-nav {
            flex: 1;
            padding: 20px 0;
        }
        
        .sidebar-nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .sidebar-nav li {
            margin-bottom: 5px;
        }
        
        .sidebar-nav li a {
            display: flex;
            align-items: center;
            padding: 10px 20px;
            color: #ecf0f1;
            text-decoration: none;
            transition: background-color 0.3s;
        }
        
        .sidebar-nav li.active a {
            background-color: #3b82f6;
            color: white;
            border-left: 4px solid #2563eb;
        }
        
        .sidebar-nav li a:hover {
            background-color: #334155;
        }
        
        .sidebar-nav .icon {
            margin-right: 10px;
            font-size: 18px;
        }
        
        .sidebar-footer {
            padding: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        
        .user-info {
            display: flex;
            align-items: center;
        }
        
        .user-avatar {
            width: 40px;
            height: 40px;
            background-color: #3b82f6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 10px;
        }
        
        .user-details {
            flex: 1;
        }
        
        .user-name {
            font-weight: bold;
            margin-bottom: 2px;
        }
        
        .user-role {
            font-size: 12px;
            color: #94a3b8;
        }
        
        /* Main Content Styles */
        .main-content {
            flex: 1;
            margin-left: 250px;
            padding: 20px;
        }
        
        .main-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background-color: white;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
            border-radius: 8px;
        }
        
        .search-box {
            display: flex;
            align-items: center;
            background-color: #f1f5f9;
            border-radius: 20px;
            padding: 5px 15px;
            width: 300px;
        }
        
        .search-box input {
            border: none;
            background: transparent;
            padding: 8px;
            width: 100%;
            outline: none;
        }
        
        .header-actions {
            display: flex;
            align-items: center;
        }
        
        .upload-btn {
            display: flex;
            align-items: center;
            background-color: #3b82f6;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 15px;
            margin-right: 15px;
            text-decoration: none;
            font-weight: bold;
        }
        
        .icon-btn {
            background: none;
            border: none;
            color: #64748b;
            font-size: 20px;
            cursor: pointer;
            margin-right: 15px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .icon-btn:hover {
            background-color: #f1f5f9;
        }
        
        .user-menu-btn {
            background: none;
            border: none;
            cursor: pointer;
        }
        
        .user-avatar-small {
            width: 32px;
            height: 32px;
            background-color: #3b82f6;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        
        /* Dashboard Styles */
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .dashboard-card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            padding: 20px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .dashboard-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .card-title {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
            color: #1e293b;
        }
        
        .card-icon {
            width: 40px;
            height: 40px;
            background-color: #3b82f6;
            color: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }
        
        .card-content {
            margin-bottom: 15px;
            color: #64748b;
        }
        
        .card-footer {
            display: flex;
            justify-content: flex-end;
        }
        
        .card-link {
            color: #3b82f6;
            text-decoration: none;
            font-weight: bold;
        }
        
        .card-link:hover {
            text-decoration: underline;
        }
        
        .page-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #1e293b;
        }
        
        .page-description {
            color: #64748b;
            margin-bottom: 20px;
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

// Serve static files if they exist
app.use(express.static(path.join(__dirname, 'public')));

// Handle API requests
app.use('/api', (req, res) => {
  res.json({ message: 'API endpoint - will be implemented in the future' });
});

// For all other requests, serve the HTML content
app.get('*', (req, res) => {
  res.send(htmlContent);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
