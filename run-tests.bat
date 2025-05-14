@echo off
REM Run FinDoc Analyzer tests
REM This script runs all tests available for FinDoc Analyzer

REM Set up logging
set LOG_DIR=.\logs
if not exist %LOG_DIR% mkdir %LOG_DIR%
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set MYDATE=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set MYTIME=%%a%%b)
set TEST_LOG=%LOG_DIR%\test-run-%MYDATE%-%MYTIME%.log

echo ==== Starting FinDoc Analyzer Tests ==== > %TEST_LOG%
echo Date: %DATE% %TIME% >> %TEST_LOG%
node -v >> %TEST_LOG%
npm -v >> %TEST_LOG%
echo. >> %TEST_LOG%

REM Ensure we have required packages
echo Checking required packages... >> %TEST_LOG%
call npm list node-fetch || call npm install node-fetch@2 --no-save

REM Run the service-level tests
echo. >> %TEST_LOG%
echo ==== Running Service Tests ==== >> %TEST_LOG%
call node test-document-chat-implementation.js >> %TEST_LOG% 2>&1

REM Run the UI tests
echo. >> %TEST_LOG%
echo ==== Running UI Tests ==== >> %TEST_LOG%
call node run-simple-ui-tests.js >> %TEST_LOG% 2>&1

REM Check exit code
if %ERRORLEVEL% EQU 0 (
    echo. >> %TEST_LOG%
    echo ==== All Tests Completed Successfully ==== >> %TEST_LOG%
) else (
    echo. >> %TEST_LOG%
    echo ==== Tests Failed with Exit Code %ERRORLEVEL% ==== >> %TEST_LOG%
)

echo Test log saved to: %TEST_LOG% >> %TEST_LOG%
echo Test reports available in: .\test-results\ >> %TEST_LOG%

REM Create index.html to view all test reports
set TEST_REPORTS_DIR=.\test-results
set INDEX_HTML=%TEST_REPORTS_DIR%\index.html

if not exist %TEST_REPORTS_DIR% mkdir %TEST_REPORTS_DIR%

echo ^<!DOCTYPE html^> > %INDEX_HTML%
echo ^<html lang="en"^> >> %INDEX_HTML%
echo ^<head^> >> %INDEX_HTML%
echo   ^<meta charset="UTF-8"^> >> %INDEX_HTML%
echo   ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> %INDEX_HTML%
echo   ^<title^>FinDoc Analyzer Test Reports^</title^> >> %INDEX_HTML%
echo   ^<style^> >> %INDEX_HTML%
echo     body { >> %INDEX_HTML%
echo       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; >> %INDEX_HTML%
echo       max-width: 800px; >> %INDEX_HTML%
echo       margin: 0 auto; >> %INDEX_HTML%
echo       padding: 20px; >> %INDEX_HTML%
echo       line-height: 1.6; >> %INDEX_HTML%
echo     } >> %INDEX_HTML%
echo     h1, h2 { >> %INDEX_HTML%
echo       color: #2c3e50; >> %INDEX_HTML%
echo     } >> %INDEX_HTML%
echo     .reports { >> %INDEX_HTML%
echo       background: #f8f9fa; >> %INDEX_HTML%
echo       padding: 20px; >> %INDEX_HTML%
echo       border-radius: 8px; >> %INDEX_HTML%
echo       margin-bottom: 20px; >> %INDEX_HTML%
echo       box-shadow: 0 2px 4px rgba(0,0,0,0.1); >> %INDEX_HTML%
echo     } >> %INDEX_HTML%
echo     .report { >> %INDEX_HTML%
echo       margin-bottom: 10px; >> %INDEX_HTML%
echo       padding: 10px; >> %INDEX_HTML%
echo       background: white; >> %INDEX_HTML%
echo       border-radius: 4px; >> %INDEX_HTML%
echo       box-shadow: 0 1px 3px rgba(0,0,0,0.05); >> %INDEX_HTML%
echo     } >> %INDEX_HTML%
echo     .timestamp { >> %INDEX_HTML%
echo       color: #7f8c8d; >> %INDEX_HTML%
echo       font-style: italic; >> %INDEX_HTML%
echo       font-size: 0.9em; >> %INDEX_HTML%
echo     } >> %INDEX_HTML%
echo   ^</style^> >> %INDEX_HTML%
echo ^</head^> >> %INDEX_HTML%
echo ^<body^> >> %INDEX_HTML%
echo   ^<h1^>FinDoc Analyzer Test Reports^</h1^> >> %INDEX_HTML%
echo   ^<p class="timestamp"^>Generated: %DATE% %TIME%^</p^> >> %INDEX_HTML%
echo   >> %INDEX_HTML%
echo   ^<div class="reports"^> >> %INDEX_HTML%
echo     ^<h2^>Available Reports^</h2^> >> %INDEX_HTML%

REM Add reports
for %%f in (%TEST_REPORTS_DIR%\*.html) do (
    if not "%%~nxf" == "index.html" (
        echo     ^<div class="report"^> >> %INDEX_HTML%
        echo       ^<a href="./%%~nxf"^>%%~nxf^</a^> >> %INDEX_HTML%
        echo       ^<div class="timestamp"^>Modified: %%~tf^</div^> >> %INDEX_HTML%
        echo     ^</div^> >> %INDEX_HTML%
    )
)

REM Add screenshots directory if it exists
if exist %TEST_REPORTS_DIR%\screenshots (
    echo     ^<div class="report"^> >> %INDEX_HTML%
    echo       ^<a href="./screenshots/"^>Screenshots^</a^> >> %INDEX_HTML%
    echo       ^<div class="timestamp"^>Modified: %DATE% %TIME%^</div^> >> %INDEX_HTML%
    echo     ^</div^> >> %INDEX_HTML%
)

echo   ^</div^> >> %INDEX_HTML%
echo   >> %INDEX_HTML%
echo   ^<h2^>Test Logs^</h2^> >> %INDEX_HTML%
echo   ^<div class="reports"^> >> %INDEX_HTML%

REM Add logs
for %%f in (%LOG_DIR%\*.log) do (
    echo     ^<div class="report"^> >> %INDEX_HTML%
    echo       ^<a href="../logs/%%~nxf"^>%%~nxf^</a^> >> %INDEX_HTML%
    echo       ^<div class="timestamp"^>Modified: %%~tf^</div^> >> %INDEX_HTML%
    echo     ^</div^> >> %INDEX_HTML%
)

echo   ^</div^> >> %INDEX_HTML%
echo ^</body^> >> %INDEX_HTML%
echo ^</html^> >> %INDEX_HTML%

echo Test report index created at: %INDEX_HTML% >> %TEST_LOG%
echo Open this file in a browser to view all test reports >> %TEST_LOG%

REM Display summary to console
type %TEST_LOG%

exit /b %ERRORLEVEL%
