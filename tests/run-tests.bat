@echo off
echo Running FinDoc Analyzer Tests...

REM Create necessary directories
mkdir -p test-results\screenshots
mkdir -p test-results\reports

REM First, make sure the application is running locally
echo Starting local server...
start /B cmd /c "cd .. && npm start"

REM Wait for the server to start
timeout /t 10

REM Run the comprehensive test
echo Running comprehensive tests...
node comprehensive-test.js --local

echo Tests completed. See test-results folder for reports.
