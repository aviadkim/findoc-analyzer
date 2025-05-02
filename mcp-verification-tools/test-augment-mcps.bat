@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Augment MCP Testing
echo ===================================================
echo.

set LOG_FILE=augment-mcp-testing.log

echo Augment MCP Testing > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Create a test project directory
set TEST_PROJECT_DIR=%TEMP%\augment-mcp-test-%RANDOM%
mkdir %TEST_PROJECT_DIR%
cd %TEST_PROJECT_DIR%

echo Creating test files...
echo Creating test files... >> %LOG_FILE%

REM Create a test file for GitHub MCP
echo // Test file for GitHub MCP > github-test.js
echo console.log('Testing GitHub MCP'); >> github-test.js

REM Create a test file for Git MCP
echo # Test file for Git MCP > git-test.py
echo print('Testing Git MCP') >> git-test.py

REM Create a test file for Memory MCP
echo // Test file for Memory MCP > memory-test.js
echo console.log('Testing Memory MCP'); >> memory-test.js

REM Create a test file for SQLite MCP
echo -- Test file for SQLite MCP > sqlite-test.sql
echo CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT); >> sqlite-test.sql
echo INSERT INTO test (name) VALUES ('Test'); >> sqlite-test.sql
echo SELECT * FROM test; >> sqlite-test.sql

echo [SUCCESS] Test files created.
echo [SUCCESS] Test files created. >> %LOG_FILE%
echo. >> %LOG_FILE%

echo ===================================================
echo Manual Testing Instructions
echo ===================================================
echo.
echo To test if the MCPs are working with Augment:
echo.
echo 1. Open Augment
echo 2. Navigate to the test project directory:
echo    %TEST_PROJECT_DIR%
echo.
echo 3. Test GitHub MCP:
echo    Ask Augment: "Create a new GitHub repository called test-repo"
echo.
echo 4. Test Git MCP:
echo    Ask Augment: "Initialize a Git repository in this directory"
echo.
echo 5. Test Memory MCP:
echo    Ask Augment: "Remember that this is a test project"
echo    Then ask: "What do you remember about this project?"
echo.
echo 6. Test SQLite MCP:
echo    Ask Augment: "Create a SQLite database and run the queries in sqlite-test.sql"
echo.
echo 7. Test other MCPs as needed
echo.
echo After testing, you can delete the test project directory:
echo %TEST_PROJECT_DIR%
echo.
echo ===================================================
echo.
echo Press any key to exit...
pause > nul
