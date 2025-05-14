@echo off
REM FinDoc Analyzer Puppeteer Test Runner
REM This script runs the Puppeteer tests with different configurations

REM Check if node is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Node.js is not installed. Please install Node.js and try again.
  exit /b 1
)

REM Check if puppeteer is installed
if not exist "node_modules\puppeteer" (
  echo Puppeteer is not installed. Installing puppeteer...
  call npm install puppeteer axios
)

REM Set default values
set BASE_URL=http://localhost:8080
set HEADLESS=true
set CREATE_SAMPLES=true
set TEST_LOCAL=true
set TEST_CLOUD=false
set CLOUD_URL=

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :done_args
if /i "%~1"=="--local" (
  set TEST_LOCAL=true
  set TEST_CLOUD=false
  shift
  goto :parse_args
)
if /i "%~1"=="--cloud" (
  set TEST_LOCAL=false
  set TEST_CLOUD=true
  if not "%~2"=="" (
    set CLOUD_URL=%~2
    shift
  )
  shift
  goto :parse_args
)
if /i "%~1"=="--both" (
  set TEST_LOCAL=true
  set TEST_CLOUD=true
  if not "%~2"=="" (
    set CLOUD_URL=%~2
    shift
  )
  shift
  goto :parse_args
)
if /i "%~1"=="--headless" (
  set HEADLESS=%~2
  shift
  shift
  goto :parse_args
)
if /i "%~1"=="--no-samples" (
  set CREATE_SAMPLES=false
  shift
  goto :parse_args
)
if /i "%~1"=="--help" (
  echo FinDoc Analyzer Puppeteer Test Runner
  echo.
  echo Usage: run-puppeteer-tests.bat [options]
  echo.
  echo Options:
  echo   --local                 Test local deployment only (default)
  echo   --cloud [url]           Test cloud deployment only
  echo   --both [url]            Test both local and cloud deployments
  echo   --headless true^|false   Run in headless mode (default: true)
  echo   --no-samples            Don't create sample documents before testing
  echo   --help                  Show this help message
  echo.
  exit /b 0
)

shift
goto :parse_args
:done_args

REM Check if we need to create a server process
if "%TEST_LOCAL%"=="true" (
  echo Starting local server...
  start "FinDoc Server" cmd /c "node server.js"
  
  REM Wait for server to start
  timeout /t 5
)

REM Run tests against local server if requested
if "%TEST_LOCAL%"=="true" (
  echo Running tests against local server...
  node fintest-puppeteer.js --url http://localhost:8080 --headless %HEADLESS% --create-samples %CREATE_SAMPLES% --results-dir ./test-results/local
)

REM Run tests against cloud server if requested
if "%TEST_CLOUD%"=="true" (
  if "%CLOUD_URL%"=="" (
    echo Cloud URL is required for cloud testing.
    echo Usage: run-puppeteer-tests.bat --cloud [url]
    if "%TEST_LOCAL%"=="true" (
      REM Don't exit if we've already run local tests
      goto :cleanup
    )
    exit /b 1
  )
  
  echo Running tests against cloud server: %CLOUD_URL%
  node fintest-puppeteer.js --url %CLOUD_URL% --headless %HEADLESS% --create-samples %CREATE_SAMPLES% --results-dir ./test-results/cloud
)

:cleanup
REM Kill the local server if we started one
if "%TEST_LOCAL%"=="true" (
  echo Stopping local server...
  taskkill /FI "WINDOWTITLE eq FinDoc Server" /F > nul 2>&1
)

echo Tests completed. See test-results directory for reports.