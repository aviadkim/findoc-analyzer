@echo off
REM Script to run the full suite of PDF processing tests

echo FinDoc PDF Processing Test Suite
echo ===============================
echo.

REM Check if node is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Error: Node.js is not installed. Please install Node.js to continue.
  exit /b 1
)

REM Check if necessary directories exist
if not exist services (
  echo Error: services directory not found. Make sure you're in the project root.
  exit /b 1
)

if not exist test-pdfs (
  echo Error: test-pdfs directory not found. Creating...
  mkdir test-pdfs
)

if not exist pdf-test-results (
  echo Creating pdf-test-results directory...
  mkdir pdf-test-results
)

if not exist mcp-logs (
  echo Creating mcp-logs directory...
  mkdir mcp-logs
)

REM Start MCPs
echo Starting MCP services...
start "Sequential Thinking MCP" cmd /c "npx @modelcontextprotocol/server-sequential-thinking > mcp-logs\sequential-thinking.log 2>&1"
echo Started Sequential Thinking MCP

start "Brave Search MCP" cmd /c "npx @modelcontextprotocol/brave-search-mcp > mcp-logs\brave-search.log 2>&1"
echo Started Brave Search MCP

REM Wait for MCPs to start
echo Waiting for MCPs to initialize...
timeout /t 5 /nobreak >nul

REM Run the simple test first
echo.
echo Running Simple PDF Test...
echo ------------------------------
node test-pdf-simple.js
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Simple PDF Test failed with exit code %ERRORLEVEL%
  set SIMPLE_TEST_RESULT=FAILED
) else (
  echo ✅ Simple PDF Test completed successfully
  set SIMPLE_TEST_RESULT=PASSED
)

REM Run optimized test if simple test passed
if "%SIMPLE_TEST_RESULT%"=="PASSED" (
  echo.
  echo Running Optimized PDF Test...
  echo ------------------------------
  node test-pdf-optimized.js
  if %ERRORLEVEL% NEQ 0 (
    echo ❌ Optimized PDF Test failed with exit code %ERRORLEVEL%
    set OPTIMIZED_TEST_RESULT=FAILED
  ) else (
    echo ✅ Optimized PDF Test completed successfully
    set OPTIMIZED_TEST_RESULT=PASSED
  )
) else (
  echo Skipping optimized test because simple test failed
  set OPTIMIZED_TEST_RESULT=FAILED
)

REM Start the PDF processing server
echo.
echo Starting PDF Processing Server for 30 seconds...
echo ------------------------------
start "PDF Processing Server" cmd /c "node pdf-processing-server-optimized.js"
set SERVER_RESULT=UNKNOWN

REM Wait 5 seconds for server to start
timeout /t 5 /nobreak >nul

REM Use PowerShell to test server connection
powershell -Command "try { $null = Invoke-WebRequest -Uri 'http://localhost:8080' -Method 'GET' -TimeoutSec 5; Write-Host '✅ Server is running and responding at http://localhost:8080'; $global:LASTEXITCODE = 0 } catch { Write-Host '❌ Server is not responding'; $global:LASTEXITCODE = 1 }"
if %ERRORLEVEL% EQU 0 (
  set SERVER_RESULT=PASSED
) else (
  set SERVER_RESULT=FAILED
)

REM Keep server running for a short while for manual testing
echo Server is running. Open http://localhost:8080 in your browser to test.
echo Server will stop automatically in 30 seconds.
timeout /t 30 /nobreak >nul

REM Kill the server
taskkill /FI "WINDOWTITLE eq PDF Processing Server" /F >nul 2>&1

REM Kill the MCPs
taskkill /FI "WINDOWTITLE eq Sequential Thinking MCP" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Brave Search MCP" /F >nul 2>&1
echo MCP services and server stopped.

REM Print summary
echo.
echo Test Summary
echo ============
echo Simple PDF Test: %SIMPLE_TEST_RESULT%
echo Optimized PDF Test: %OPTIMIZED_TEST_RESULT%
echo PDF Processing Server: %SERVER_RESULT%
echo.
echo Results are available in the 'pdf-test-results' directory.
echo.
echo For more information, see the documentation files:
echo - README-PDF-PROCESSING.md - Overview of the system
echo - PDF-PROCESSING-GUIDE.md - Detailed guide
echo - PDF-PROCESSING-FINAL.md - Implementation status
echo - PDF-PROCESSING-SUMMARY.md - Testing summary

pause