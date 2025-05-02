@echo off
echo ===================================================
echo Setting up GitHub MCP Server
echo ===================================================
echo.

REM Create directory if it doesn't exist
echo Creating directory...
mkdir "C:\Users\aviad\OneDrive\Desktop\MCP\github" 2>nul
echo Directory created.
echo.

REM Create the GitHub MCP script
echo Creating GitHub MCP script...
(
echo #!/usr/bin/env node
echo.
echo /**
echo  * GitHub MCP Server
echo  * 
echo  * This script starts an MCP server for GitHub.
echo  */
echo.
echo const { Server } = require^('@modelcontextprotocol/server'^);
echo const { Octokit } = require^('@octokit/rest'^);
echo.
echo // Check for API key
echo const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || 'YOUR_GITHUB_TOKEN';
echo.
echo // Initialize Octokit
echo const octokit = new Octokit^({
echo   auth: GITHUB_TOKEN
echo }^);
echo.
echo // Create MCP server
echo const server = new Server^('github'^);
echo.
echo // Register getRepository method
echo server.registerMethod^('getRepository', async ^(params^) ^=^> {
echo   const { owner, repo } = params;
echo   
echo   if ^(!owner ^|^| !repo^) {
echo     throw new Error^('Owner and repo parameters are required'^);
echo   }
echo   
echo   try {
echo     const { data } = await octokit.repos.get^({
echo       owner,
echo       repo
echo     }^);
echo     
echo     return {
echo       id: data.id,
echo       name: data.name,
echo       full_name: data.full_name,
echo       description: data.description,
echo       url: data.html_url,
echo       stars: data.stargazers_count,
echo       forks: data.forks_count,
echo       issues: data.open_issues_count,
echo       language: data.language,
echo       created_at: data.created_at,
echo       updated_at: data.updated_at
echo     };
echo   } catch ^(error^) {
echo     console.error^('Error getting repository:', error^);
echo     throw new Error^(`Failed to get repository: ${error.message}`^);
echo   }
echo }^);
echo.
echo // Register getIssues method
echo server.registerMethod^('getIssues', async ^(params^) ^=^> {
echo   const { owner, repo, state = 'open' } = params;
echo   
echo   if ^(!owner ^|^| !repo^) {
echo     throw new Error^('Owner and repo parameters are required'^);
echo   }
echo   
echo   try {
echo     const { data } = await octokit.issues.listForRepo^({
echo       owner,
echo       repo,
echo       state
echo     }^);
echo     
echo     return {
echo       issues: data.map^(issue ^=^> ^({
echo         id: issue.id,
echo         number: issue.number,
echo         title: issue.title,
echo         state: issue.state,
echo         url: issue.html_url,
echo         created_at: issue.created_at,
echo         updated_at: issue.updated_at,
echo         user: {
echo           login: issue.user.login,
echo           url: issue.user.html_url
echo         }
echo       }^)^)
echo     };
echo   } catch ^(error^) {
echo     console.error^('Error getting issues:', error^);
echo     throw new Error^(`Failed to get issues: ${error.message}`^);
echo   }
echo }^);
echo.
echo // Register getPullRequests method
echo server.registerMethod^('getPullRequests', async ^(params^) ^=^> {
echo   const { owner, repo, state = 'open' } = params;
echo   
echo   if ^(!owner ^|^| !repo^) {
echo     throw new Error^('Owner and repo parameters are required'^);
echo   }
echo   
echo   try {
echo     const { data } = await octokit.pulls.list^({
echo       owner,
echo       repo,
echo       state
echo     }^);
echo     
echo     return {
echo       pull_requests: data.map^(pr ^=^> ^({
echo         id: pr.id,
echo         number: pr.number,
echo         title: pr.title,
echo         state: pr.state,
echo         url: pr.html_url,
echo         created_at: pr.created_at,
echo         updated_at: pr.updated_at,
echo         user: {
echo           login: pr.user.login,
echo           url: pr.user.html_url
echo         }
echo       }^)^)
echo     };
echo   } catch ^(error^) {
echo     console.error^('Error getting pull requests:', error^);
echo     throw new Error^(`Failed to get pull requests: ${error.message}`^);
echo   }
echo }^);
echo.
echo // Start server
echo server.listen^(3001, ^(^) ^=^> {
echo   console.log^('GitHub MCP server running on port 3001'^);
echo   console.log^('Ready to accept GitHub API requests'^);
echo }^);
) > "C:\Users\aviad\OneDrive\Desktop\MCP\github\run-github.js"
echo Script created.
echo.

REM Install dependencies
echo Installing dependencies...
cd "C:\Users\aviad\OneDrive\Desktop\MCP\github"
call npm init -y
call npm install @modelcontextprotocol/server @octokit/rest
echo Dependencies installed.
echo.

echo ===================================================
echo GitHub MCP Server Setup Complete!
echo ===================================================
echo.
echo The GitHub MCP server has been set up at:
echo C:\Users\aviad\OneDrive\Desktop\MCP\github\run-github.js
echo.
echo To configure Augment to use this server:
echo 1. Open Augment
echo 2. Go to Settings
echo 3. Navigate to the MCP section
echo 4. Add a new MCP server with:
echo    - Name: GitHub MCP
echo    - Command: cmd /c node C:\Users\aviad\OneDrive\Desktop\MCP\github\run-github.js
echo    - Environment Variables:
echo      - GITHUB_PERSONAL_ACCESS_TOKEN: YOUR_GITHUB_TOKEN
echo.
echo To test the server, you can run:
echo node C:\Users\aviad\OneDrive\Desktop\MCP\github\run-github.js
echo.
echo Press any key to exit...
pause > nul
