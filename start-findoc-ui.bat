@echo off
echo ===================================================
echo Starting FinDoc UI with Sidebar
echo ===================================================
echo.

REM Create a simple Express server to serve the UI
echo Creating Express server file...
echo const express = require('express'); > temp-server.js
echo const path = require('path'); >> temp-server.js
echo const fs = require('fs'); >> temp-server.js
echo. >> temp-server.js
echo const app = express(); >> temp-server.js
echo const PORT = process.env.PORT || 3002; >> temp-server.js
echo. >> temp-server.js
echo // Create HTML content as a string >> temp-server.js
echo const htmlContent = `<!DOCTYPE html> >> temp-server.js
echo <html> >> temp-server.js
echo <head> >> temp-server.js
echo     <title>FinDoc Analyzer</title> >> temp-server.js
echo     <style> >> temp-server.js
echo         body { >> temp-server.js
echo             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; >> temp-server.js
echo             margin: 0; >> temp-server.js
echo             padding: 0; >> temp-server.js
echo             display: flex; >> temp-server.js
echo             min-height: 100vh; >> temp-server.js
echo             background-color: #f7f9fc; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         /* Sidebar Styles */ >> temp-server.js
echo         .sidebar { >> temp-server.js
echo             width: 250px; >> temp-server.js
echo             background-color: #2c3e50; >> temp-server.js
echo             color: white; >> temp-server.js
echo             height: 100vh; >> temp-server.js
echo             position: fixed; >> temp-server.js
echo             left: 0; >> temp-server.js
echo             top: 0; >> temp-server.js
echo             display: flex; >> temp-server.js
echo             flex-direction: column; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .sidebar-header { >> temp-server.js
echo             padding: 20px; >> temp-server.js
echo             border-bottom: 1px solid rgba(255,255,255,0.1); >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .app-title { >> temp-server.js
echo             margin: 0; >> temp-server.js
echo             font-size: 24px; >> temp-server.js
echo             font-weight: bold; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .sidebar-nav { >> temp-server.js
echo             flex: 1; >> temp-server.js
echo             padding: 20px 0; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .sidebar-nav ul { >> temp-server.js
echo             list-style: none; >> temp-server.js
echo             padding: 0; >> temp-server.js
echo             margin: 0; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .sidebar-nav li { >> temp-server.js
echo             margin-bottom: 5px; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .sidebar-nav li a { >> temp-server.js
echo             display: flex; >> temp-server.js
echo             align-items: center; >> temp-server.js
echo             padding: 10px 20px; >> temp-server.js
echo             color: #ecf0f1; >> temp-server.js
echo             text-decoration: none; >> temp-server.js
echo             transition: background-color 0.3s; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .sidebar-nav li.active a { >> temp-server.js
echo             background-color: #3498db; >> temp-server.js
echo             color: white; >> temp-server.js
echo             border-left: 4px solid #2980b9; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .sidebar-nav li a:hover { >> temp-server.js
echo             background-color: #34495e; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .sidebar-nav .icon { >> temp-server.js
echo             margin-right: 10px; >> temp-server.js
echo             font-size: 18px; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .sidebar-footer { >> temp-server.js
echo             padding: 20px; >> temp-server.js
echo             border-top: 1px solid rgba(255,255,255,0.1); >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .user-info { >> temp-server.js
echo             display: flex; >> temp-server.js
echo             align-items: center; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .user-avatar { >> temp-server.js
echo             width: 40px; >> temp-server.js
echo             height: 40px; >> temp-server.js
echo             background-color: #3498db; >> temp-server.js
echo             border-radius: 50%%; >> temp-server.js
echo             display: flex; >> temp-server.js
echo             align-items: center; >> temp-server.js
echo             justify-content: center; >> temp-server.js
echo             font-weight: bold; >> temp-server.js
echo             margin-right: 10px; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .user-details { >> temp-server.js
echo             flex: 1; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .user-name { >> temp-server.js
echo             font-weight: bold; >> temp-server.js
echo             margin-bottom: 2px; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .user-role { >> temp-server.js
echo             font-size: 12px; >> temp-server.js
echo             color: #bdc3c7; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         /* Main Content Styles */ >> temp-server.js
echo         .main-content { >> temp-server.js
echo             flex: 1; >> temp-server.js
echo             margin-left: 250px; >> temp-server.js
echo             padding: 20px; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .main-header { >> temp-server.js
echo             display: flex; >> temp-server.js
echo             justify-content: space-between; >> temp-server.js
echo             align-items: center; >> temp-server.js
echo             padding: 15px 20px; >> temp-server.js
echo             background-color: white; >> temp-server.js
echo             box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); >> temp-server.js
echo             margin-bottom: 20px; >> temp-server.js
echo             border-radius: 8px; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .search-box { >> temp-server.js
echo             display: flex; >> temp-server.js
echo             align-items: center; >> temp-server.js
echo             background-color: #f5f5f5; >> temp-server.js
echo             border-radius: 20px; >> temp-server.js
echo             padding: 5px 15px; >> temp-server.js
echo             width: 300px; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .search-box input { >> temp-server.js
echo             border: none; >> temp-server.js
echo             background: transparent; >> temp-server.js
echo             padding: 8px; >> temp-server.js
echo             width: 100%%; >> temp-server.js
echo             outline: none; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .header-actions { >> temp-server.js
echo             display: flex; >> temp-server.js
echo             align-items: center; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .upload-btn { >> temp-server.js
echo             display: flex; >> temp-server.js
echo             align-items: center; >> temp-server.js
echo             background-color: #3498db; >> temp-server.js
echo             color: white; >> temp-server.js
echo             border: none; >> temp-server.js
echo             border-radius: 4px; >> temp-server.js
echo             padding: 8px 15px; >> temp-server.js
echo             margin-right: 15px; >> temp-server.js
echo             text-decoration: none; >> temp-server.js
echo             font-weight: bold; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .icon-btn { >> temp-server.js
echo             background: none; >> temp-server.js
echo             border: none; >> temp-server.js
echo             color: #7f8c8d; >> temp-server.js
echo             font-size: 20px; >> temp-server.js
echo             cursor: pointer; >> temp-server.js
echo             margin-right: 15px; >> temp-server.js
echo             width: 40px; >> temp-server.js
echo             height: 40px; >> temp-server.js
echo             border-radius: 50%%; >> temp-server.js
echo             display: flex; >> temp-server.js
echo             align-items: center; >> temp-server.js
echo             justify-content: center; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .icon-btn:hover { >> temp-server.js
echo             background-color: #f5f5f5; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .user-menu-btn { >> temp-server.js
echo             background: none; >> temp-server.js
echo             border: none; >> temp-server.js
echo             cursor: pointer; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .user-avatar-small { >> temp-server.js
echo             width: 32px; >> temp-server.js
echo             height: 32px; >> temp-server.js
echo             background-color: #3498db; >> temp-server.js
echo             color: white; >> temp-server.js
echo             border-radius: 50%%; >> temp-server.js
echo             display: flex; >> temp-server.js
echo             align-items: center; >> temp-server.js
echo             justify-content: center; >> temp-server.js
echo             font-weight: bold; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         /* Dashboard Styles */ >> temp-server.js
echo         .dashboard-grid { >> temp-server.js
echo             display: grid; >> temp-server.js
echo             grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); >> temp-server.js
echo             gap: 20px; >> temp-server.js
echo             margin-top: 20px; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .dashboard-card { >> temp-server.js
echo             background-color: white; >> temp-server.js
echo             border-radius: 8px; >> temp-server.js
echo             box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); >> temp-server.js
echo             padding: 20px; >> temp-server.js
echo             transition: transform 0.3s ease, box-shadow 0.3s ease; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .dashboard-card:hover { >> temp-server.js
echo             transform: translateY(-5px); >> temp-server.js
echo             box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .card-header { >> temp-server.js
echo             display: flex; >> temp-server.js
echo             justify-content: space-between; >> temp-server.js
echo             align-items: center; >> temp-server.js
echo             margin-bottom: 15px; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .card-title { >> temp-server.js
echo             font-size: 18px; >> temp-server.js
echo             font-weight: bold; >> temp-server.js
echo             margin: 0; >> temp-server.js
echo             color: #2c3e50; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .card-icon { >> temp-server.js
echo             width: 40px; >> temp-server.js
echo             height: 40px; >> temp-server.js
echo             background-color: #3498db; >> temp-server.js
echo             color: white; >> temp-server.js
echo             border-radius: 8px; >> temp-server.js
echo             display: flex; >> temp-server.js
echo             align-items: center; >> temp-server.js
echo             justify-content: center; >> temp-server.js
echo             font-size: 20px; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .card-content { >> temp-server.js
echo             margin-bottom: 15px; >> temp-server.js
echo             color: #7f8c8d; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .card-footer { >> temp-server.js
echo             display: flex; >> temp-server.js
echo             justify-content: flex-end; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .card-link { >> temp-server.js
echo             color: #3498db; >> temp-server.js
echo             text-decoration: none; >> temp-server.js
echo             font-weight: bold; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .card-link:hover { >> temp-server.js
echo             text-decoration: underline; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .page-title { >> temp-server.js
echo             font-size: 24px; >> temp-server.js
echo             font-weight: bold; >> temp-server.js
echo             margin-bottom: 10px; >> temp-server.js
echo             color: #2c3e50; >> temp-server.js
echo         } >> temp-server.js
echo. >> temp-server.js
echo         .page-description { >> temp-server.js
echo             color: #7f8c8d; >> temp-server.js
echo             margin-bottom: 20px; >> temp-server.js
echo         } >> temp-server.js
echo     </style> >> temp-server.js
echo </head> >> temp-server.js
echo <body> >> temp-server.js
echo     <!-- Sidebar --> >> temp-server.js
echo     <aside class="sidebar"> >> temp-server.js
echo         <div class="sidebar-header"> >> temp-server.js
echo             <h1 class="app-title">FinDoc Analyzer</h1> >> temp-server.js
echo         </div> >> temp-server.js
echo         <nav class="sidebar-nav"> >> temp-server.js
echo             <ul> >> temp-server.js
echo                 <li class="active"><a href="/"><span class="icon">📊</span> Dashboard</a></li> >> temp-server.js
echo                 <li><a href="/upload"><span class="icon">📤</span> Upload Documents</a></li> >> temp-server.js
echo                 <li><a href="/analytics"><span class="icon">📈</span> Analytics</a></li> >> temp-server.js
echo                 <li><a href="/reports"><span class="icon">📄</span> Reports</a></li> >> temp-server.js
echo                 <li><a href="/test-center"><span class="icon">🧪</span> Testing</a></li> >> temp-server.js
echo                 <li><a href="/dev-test-center"><span class="icon">⚙️</span> Dev Testing</a></li> >> temp-server.js
echo                 <li><a href="/settings"><span class="icon">⚙️</span> Settings</a></li> >> temp-server.js
echo             </ul> >> temp-server.js
echo         </nav> >> temp-server.js
echo         <div class="sidebar-footer"> >> temp-server.js
echo             <div class="user-info"> >> temp-server.js
echo                 <div class="user-avatar">AB</div> >> temp-server.js
echo                 <div class="user-details"> >> temp-server.js
echo                     <div class="user-name">Aviad B.</div> >> temp-server.js
echo                     <div class="user-role">Administrator</div> >> temp-server.js
echo                 </div> >> temp-server.js
echo             </div> >> temp-server.js
echo         </div> >> temp-server.js
echo     </aside> >> temp-server.js
echo. >> temp-server.js
echo     <!-- Main content --> >> temp-server.js
echo     <main class="main-content"> >> temp-server.js
echo         <!-- Header --> >> temp-server.js
echo         <header class="main-header"> >> temp-server.js
echo             <div class="search-box"> >> temp-server.js
echo                 <input type="text" placeholder="Search documents..." /> >> temp-server.js
echo                 <span class="icon">🔍</span> >> temp-server.js
echo             </div> >> temp-server.js
echo             <div class="header-actions"> >> temp-server.js
echo                 <a href="/upload" class="upload-btn"> >> temp-server.js
echo                     <span class="icon">📤</span> >> temp-server.js
echo                     <span>Upload Document</span> >> temp-server.js
echo                 </a> >> temp-server.js
echo                 <button class="icon-btn">🔔</button> >> temp-server.js
echo                 <button class="user-menu-btn"> >> temp-server.js
echo                     <div class="user-avatar-small">AB</div> >> temp-server.js
echo                 </button> >> temp-server.js
echo             </div> >> temp-server.js
echo         </header> >> temp-server.js
echo         >> temp-server.js
echo         <!-- Page content --> >> temp-server.js
echo         <h1 class="page-title">Financial Document Dashboard</h1> >> temp-server.js
echo         <p class="page-description">Welcome to the FinDoc Analyzer dashboard. Here you can manage and analyze your financial documents.</p> >> temp-server.js
echo         >> temp-server.js
echo         <div class="dashboard-grid"> >> temp-server.js
echo             <div class="dashboard-card"> >> temp-server.js
echo                 <div class="card-header"> >> temp-server.js
echo                     <h2 class="card-title">Recent Documents</h2> >> temp-server.js
echo                     <div class="card-icon">📄</div> >> temp-server.js
echo                 </div> >> temp-server.js
echo                 <div class="card-content"> >> temp-server.js
echo                     <p>You have 3 recently processed documents.</p> >> temp-server.js
echo                 </div> >> temp-server.js
echo                 <div class="card-footer"> >> temp-server.js
echo                     <a href="/documents" class="card-link">View All Documents</a> >> temp-server.js
echo                 </div> >> temp-server.js
echo             </div> >> temp-server.js
echo             >> temp-server.js
echo             <div class="dashboard-card"> >> temp-server.js
echo                 <div class="card-header"> >> temp-server.js
echo                     <h2 class="card-title">Portfolio Summary</h2> >> temp-server.js
echo                     <div class="card-icon">💼</div> >> temp-server.js
echo                 </div> >> temp-server.js
echo                 <div class="card-content"> >> temp-server.js
echo                     <p>Total portfolio value: $19,510,599</p> >> temp-server.js
echo                 </div> >> temp-server.js
echo                 <div class="card-footer"> >> temp-server.js
echo                     <a href="/portfolio" class="card-link">View Portfolio</a> >> temp-server.js
echo                 </div> >> temp-server.js
echo             </div> >> temp-server.js
echo             >> temp-server.js
echo             <div class="dashboard-card"> >> temp-server.js
echo                 <div class="card-header"> >> temp-server.js
echo                     <h2 class="card-title">Document Analysis</h2> >> temp-server.js
echo                     <div class="card-icon">🔍</div> >> temp-server.js
echo                 </div> >> temp-server.js
echo                 <div class="card-content"> >> temp-server.js
echo                     <p>Run analysis on your financial documents.</p> >> temp-server.js
echo                 </div> >> temp-server.js
echo                 <div class="card-footer"> >> temp-server.js
echo                     <a href="/analysis" class="card-link">Start Analysis</a> >> temp-server.js
echo                 </div> >> temp-server.js
echo             </div> >> temp-server.js
echo             >> temp-server.js
echo             <div class="dashboard-card"> >> temp-server.js
echo                 <div class="card-header"> >> temp-server.js
echo                     <h2 class="card-title">Data Export</h2> >> temp-server.js
echo                     <div class="card-icon">📊</div> >> temp-server.js
echo                 </div> >> temp-server.js
echo                 <div class="card-content"> >> temp-server.js
echo                     <p>Export your financial data in various formats.</p> >> temp-server.js
echo                 </div> >> temp-server.js
echo                 <div class="card-footer"> >> temp-server.js
echo                     <a href="/export" class="card-link">Export Data</a> >> temp-server.js
echo                 </div> >> temp-server.js
echo             </div> >> temp-server.js
echo         </div> >> temp-server.js
echo     </main> >> temp-server.js
echo </body> >> temp-server.js
echo </html>`; >> temp-server.js
echo. >> temp-server.js
echo // Serve static files if they exist >> temp-server.js
echo app.use(express.static(path.join(__dirname, 'public'))); >> temp-server.js
echo. >> temp-server.js
echo // Handle API requests >> temp-server.js
echo app.use('/api', (req, res) => { >> temp-server.js
echo   res.json({ message: 'API endpoint - will be implemented in the future' }); >> temp-server.js
echo }); >> temp-server.js
echo. >> temp-server.js
echo // For all other requests, serve the HTML content >> temp-server.js
echo app.get('*', (req, res) => { >> temp-server.js
echo   res.send(htmlContent); >> temp-server.js
echo }); >> temp-server.js
echo. >> temp-server.js
echo // Start the server >> temp-server.js
echo app.listen(PORT, () => { >> temp-server.js
echo   console.log(`Server running on port ${PORT}`); >> temp-server.js
echo }); >> temp-server.js

REM Install Express if not already installed
echo Installing Express...
cd backv2-github\DevDocs\frontend
call npm install express

REM Start the server
echo Starting the server...
node ..\..\..\..\temp-server.js

REM Clean up
echo Cleaning up...
cd ..\..\..\..\
del temp-server.js

echo ===================================================
echo Server stopped
echo ===================================================
