const http = require('http');
const PORT = 3002;

// Create HTML content as a string
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>FinDoc Analyzer</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            min-height: 100vh;
            background-color: #f5f5f5;
        }
        
        /* Sidebar Styles */
        .sidebar {
            width: 250px;
            background-color: #2c3e50;
            color: white;
            height: 100vh;
            position: fixed;
            left: 0;
            top: 0;
            display: flex;
            flex-direction: column;
        }
        
        .sidebar-header {
            padding: 20px;
            border-bottom: 1px solid #34495e;
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
            background-color: #3498db;
            color: white;
            border-left: 4px solid #2980b9;
        }
        
        .sidebar-nav li a:hover {
            background-color: #34495e;
        }
        
        .sidebar-nav .icon {
            margin-right: 10px;
            font-size: 18px;
        }
        
        .sidebar-footer {
            padding: 20px;
            border-top: 1px solid #34495e;
        }
        
        .user-info {
            display: flex;
            align-items: center;
        }
        
        .user-avatar {
            width: 40px;
            height: 40px;
            background-color: #3498db;
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
            color: #bdc3c7;
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
            background-color: #f5f5f5;
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
            background-color: #3498db;
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
            color: #7f8c8d;
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
            background-color: #f5f5f5;
        }
        
        .user-menu-btn {
            background: none;
            border: none;
            cursor: pointer;
        }
        
        .user-avatar-small {
            width: 32px;
            height: 32px;
            background-color: #3498db;
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
            color: #2c3e50;
        }
        
        .card-icon {
            width: 40px;
            height: 40px;
            background-color: #3498db;
            color: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }
        
        .card-content {
            margin-bottom: 15px;
            color: #7f8c8d;
        }
        
        .card-footer {
            display: flex;
            justify-content: flex-end;
        }
        
        .card-link {
            color: #3498db;
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
            color: #2c3e50;
        }
        
        .page-description {
            color: #7f8c8d;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <h1 class="app-title">FinDoc Analyzer</h1>
        </div>
        <nav class="sidebar-nav">
            <ul>
                <li class="active"><a href="/"><span class="icon">📊</span> Dashboard</a></li>
                <li><a href="/upload"><span class="icon">📤</span> Upload Documents</a></li>
                <li><a href="/analytics"><span class="icon">📈</span> Analytics</a></li>
                <li><a href="/reports"><span class="icon">📄</span> Reports</a></li>
                <li><a href="/test-center"><span class="icon">🧪</span> Testing</a></li>
                <li><a href="/dev-test-center"><span class="icon">⚙️</span> Dev Testing</a></li>
                <li><a href="/settings"><span class="icon">⚙️</span> Settings</a></li>
            </ul>
        </nav>
        <div class="sidebar-footer">
            <div class="user-info">
                <div class="user-avatar">AB</div>
                <div class="user-details">
                    <div class="user-name">Aviad B.</div>
                    <div class="user-role">Administrator</div>
                </div>
            </div>
        </div>
    </aside>

    <!-- Main content -->
    <main class="main-content">
        <!-- Header -->
        <header class="main-header">
            <div class="search-box">
                <input type="text" placeholder="Search documents..." />
                <span class="icon">🔍</span>
            </div>
            <div class="header-actions">
                <a href="/upload" class="upload-btn">
                    <span class="icon">📤</span>
                    <span>Upload Document</span>
                </a>
                <button class="icon-btn">🔔</button>
                <button class="user-menu-btn">
                    <div class="user-avatar-small">AB</div>
                </button>
            </div>
        </header>
        
        <!-- Page content -->
        <h1 class="page-title">Financial Document Dashboard</h1>
        <p class="page-description">Welcome to the FinDoc Analyzer dashboard. Here you can manage and analyze your financial documents.</p>
        
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <div class="card-header">
                    <h2 class="card-title">Recent Documents</h2>
                    <div class="card-icon">📄</div>
                </div>
                <div class="card-content">
                    <p>You have 3 recently processed documents.</p>
                </div>
                <div class="card-footer">
                    <a href="/documents" class="card-link">View All Documents</a>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <h2 class="card-title">Portfolio Summary</h2>
                    <div class="card-icon">💼</div>
                </div>
                <div class="card-content">
                    <p>Total portfolio value: $19,510,599</p>
                </div>
                <div class="card-footer">
                    <a href="/portfolio" class="card-link">View Portfolio</a>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <h2 class="card-title">Document Analysis</h2>
                    <div class="card-icon">🔍</div>
                </div>
                <div class="card-content">
                    <p>Run analysis on your financial documents.</p>
                </div>
                <div class="card-footer">
                    <a href="/analysis" class="card-link">Start Analysis</a>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <h2 class="card-title">Data Export</h2>
                    <div class="card-icon">📊</div>
                </div>
                <div class="card-content">
                    <p>Export your financial data in various formats.</p>
                </div>
                <div class="card-footer">
                    <a href="/export" class="card-link">Export Data</a>
                </div>
            </div>
        </div>
    </main>
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
