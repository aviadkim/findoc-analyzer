@echo off
echo FinDoc Analyzer UI Fix

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Error: Node.js is not installed or not in PATH.
  echo Please install Node.js from: https://nodejs.org/
  exit /b 1
)

REM Create directories if they don't exist
if not exist "tests\results" mkdir "tests\results"

REM Run the UI test
echo.
echo === Running UI Test ===
echo.
node tests\simple-ui-test.js

REM Add UI fix script to HTML pages
echo.
echo === Adding UI Fix Script to HTML Pages ===
echo.
node scripts\add-ui-fix.js

REM Open the test report
echo.
echo === Opening Test Report ===
echo.
start "" "tests\results\ui-test-report.html"

echo.
echo UI Fix completed. Check the test report for details.
echo.
