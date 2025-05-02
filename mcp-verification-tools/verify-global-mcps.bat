@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Global MCP Verification
echo ===================================================
echo.

set GLOBAL_MCP_DIR=C:\Users\aviad\.mcp-servers
set LOG_FILE=mcp-verification.log

echo Global MCP Verification > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

echo Step 1: Checking if MCP files exist in the correct locations...
echo Step 1: Checking if MCP files exist in the correct locations... >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Check JavaScript MCPs
echo Checking JavaScript MCPs...
echo Checking JavaScript MCPs... >> %LOG_FILE%
set JS_MCP_COUNT=0
for %%f in (%GLOBAL_MCP_DIR%\js\*.js) do (
    set /a JS_MCP_COUNT+=1
    echo [FOUND] %%~nxf >> %LOG_FILE%
)
echo Found !JS_MCP_COUNT! JavaScript MCPs.
echo Found !JS_MCP_COUNT! JavaScript MCPs. >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Check Python MCPs
echo Checking Python MCPs...
echo Checking Python MCPs... >> %LOG_FILE%
set PY_MCP_COUNT=0
for %%f in (%GLOBAL_MCP_DIR%\py\*.py) do (
    set /a PY_MCP_COUNT+=1
    echo [FOUND] %%~nxf >> %LOG_FILE%
)
echo Found !PY_MCP_COUNT! Python MCPs.
echo Found !PY_MCP_COUNT! Python MCPs. >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Check TypeScript MCPs
echo Checking TypeScript MCPs...
echo Checking TypeScript MCPs... >> %LOG_FILE%
set TS_MCP_COUNT=0
for %%f in (%GLOBAL_MCP_DIR%\ts\*.ts) do (
    set /a TS_MCP_COUNT+=1
    echo [FOUND] %%~nxf >> %LOG_FILE%
)
echo Found !TS_MCP_COUNT! TypeScript MCPs.
echo Found !TS_MCP_COUNT! TypeScript MCPs. >> %LOG_FILE%
echo. >> %LOG_FILE%

set /a TOTAL_MCP_COUNT=!JS_MCP_COUNT!+!PY_MCP_COUNT!+!TS_MCP_COUNT!
echo Total MCPs found: !TOTAL_MCP_COUNT!
echo Total MCPs found: !TOTAL_MCP_COUNT! >> %LOG_FILE%
echo. >> %LOG_FILE%

echo Step 2: Checking Augment configuration...
echo Step 2: Checking Augment configuration... >> %LOG_FILE%
echo. >> %LOG_FILE%

set AUGMENT_SETTINGS_FILE=%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
set AUGMENT_SETTINGS_FOUND=0

if exist "%AUGMENT_SETTINGS_FILE%" (
    echo [FOUND] Augment settings file: %AUGMENT_SETTINGS_FILE%
    echo [FOUND] Augment settings file: %AUGMENT_SETTINGS_FILE% >> %LOG_FILE%
    set AUGMENT_SETTINGS_FOUND=1
) else (
    echo [NOT FOUND] Augment settings file: %AUGMENT_SETTINGS_FILE%
    echo [NOT FOUND] Augment settings file: %AUGMENT_SETTINGS_FILE% >> %LOG_FILE%
    
    REM Try alternative locations
    set ALTERNATIVE_SETTINGS_FILE=%USERPROFILE%\.augment\settings\mcp_settings.json
    if exist "!ALTERNATIVE_SETTINGS_FILE!" (
        echo [FOUND] Alternative Augment settings file: !ALTERNATIVE_SETTINGS_FILE!
        echo [FOUND] Alternative Augment settings file: !ALTERNATIVE_SETTINGS_FILE! >> %LOG_FILE%
        set AUGMENT_SETTINGS_FILE=!ALTERNATIVE_SETTINGS_FILE!
        set AUGMENT_SETTINGS_FOUND=1
    ) else (
        echo [NOT FOUND] Alternative Augment settings file: !ALTERNATIVE_SETTINGS_FILE!
        echo [NOT FOUND] Alternative Augment settings file: !ALTERNATIVE_SETTINGS_FILE! >> %LOG_FILE%
    )
)

echo. >> %LOG_FILE%

echo Step 3: Testing key MCPs...
echo Step 3: Testing key MCPs... >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Create a temporary directory for testing
set TEMP_DIR=%TEMP%\mcp-test-%RANDOM%
mkdir %TEMP_DIR%
cd %TEMP_DIR%

echo Testing GitHub MCP...
echo Testing GitHub MCP... >> %LOG_FILE%
node %GLOBAL_MCP_DIR%\js\github-mcp.js --help > github-mcp-test.log 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] GitHub MCP test passed.
    echo [SUCCESS] GitHub MCP test passed. >> %LOG_FILE%
) else (
    echo [FAILED] GitHub MCP test failed.
    echo [FAILED] GitHub MCP test failed. >> %LOG_FILE%
    type github-mcp-test.log >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo Testing Memory MCP...
echo Testing Memory MCP... >> %LOG_FILE%
node %GLOBAL_MCP_DIR%\js\memory-mcp.js --help > memory-mcp-test.log 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Memory MCP test passed.
    echo [SUCCESS] Memory MCP test passed. >> %LOG_FILE%
) else (
    echo [FAILED] Memory MCP test failed.
    echo [FAILED] Memory MCP test failed. >> %LOG_FILE%
    type memory-mcp-test.log >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo Testing Git MCP...
echo Testing Git MCP... >> %LOG_FILE%
python %GLOBAL_MCP_DIR%\py\git_mcp.py --help > git-mcp-test.log 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Git MCP test passed.
    echo [SUCCESS] Git MCP test passed. >> %LOG_FILE%
) else (
    echo [FAILED] Git MCP test failed.
    echo [FAILED] Git MCP test failed. >> %LOG_FILE%
    type git-mcp-test.log >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo Testing Brave Search MCP...
echo Testing Brave Search MCP... >> %LOG_FILE%
ts-node %GLOBAL_MCP_DIR%\ts\brave-search-mcp.ts --help > brave-search-mcp-test.log 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Brave Search MCP test passed.
    echo [SUCCESS] Brave Search MCP test passed. >> %LOG_FILE%
) else (
    echo [FAILED] Brave Search MCP test failed.
    echo [FAILED] Brave Search MCP test failed. >> %LOG_FILE%
    type brave-search-mcp-test.log >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Clean up
cd %~dp0
rmdir /s /q %TEMP_DIR%

echo ===================================================
echo Verification Summary
echo ===================================================
echo.
echo Total MCPs found: !TOTAL_MCP_COUNT!
if !AUGMENT_SETTINGS_FOUND! EQU 1 (
    echo Augment settings file found.
) else (
    echo Augment settings file not found.
)
echo.
echo Detailed verification results have been saved to %LOG_FILE%
echo.
echo Next Steps:
echo 1. If all tests passed, your global MCPs are set up correctly.
echo 2. If any tests failed, check the log file for details.
echo 3. Make sure Augment is configured to use these global MCPs.
echo.
echo To configure Augment to use global MCPs:
echo - Open Augment settings
echo - Go to MCP configuration
echo - Make sure each MCP points to the correct file in %GLOBAL_MCP_DIR%
echo.
echo ===================================================
echo.
echo Press any key to exit...
pause > nul
