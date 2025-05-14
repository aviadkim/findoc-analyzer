@echo off
echo Starting Sequential Thinking QA Tests...

REM Make sure the MCP servers are running
call start-mcps.bat

REM Wait a moment for the MCP servers to initialize
timeout /t 5

REM Install required dependencies if not already installed
npm install --no-save playwright axios

REM Run the comprehensive QA tests
node sequential-qa-test.js

echo Tests completed. Check qa-test-results folder for report.