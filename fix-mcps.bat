@echo off
echo ===================================================
echo Fixing MCP Issues
echo ===================================================
echo.

set LOG_FILE=fix-mcps.log
echo Fixing MCP Issues > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Fix Git MCP
echo Fixing Git MCP...
echo Fixing Git MCP... >> %LOG_FILE%
echo Checking if Git is installed...
echo Checking if Git is installed... >> %LOG_FILE%
git --version >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Git is not installed or not in PATH.
    echo [WARNING] Git is not installed or not in PATH. >> %LOG_FILE%
    echo Please install Git from https://git-scm.com/downloads
    echo Please install Git from https://git-scm.com/downloads >> %LOG_FILE%
) else (
    echo [SUCCESS] Git is installed.
    echo [SUCCESS] Git is installed. >> %LOG_FILE%
    echo Fixing Git MCP path issues...
    echo Fixing Git MCP path issues... >> %LOG_FILE%
    
    REM Create a wrapper script for Git MCP
    echo @echo off > git-mcp-wrapper.bat
    echo set REPO_PATH=%%1 >> git-mcp-wrapper.bat
    echo if "%%REPO_PATH%%"=="." set REPO_PATH=%CD% >> git-mcp-wrapper.bat
    echo python -m git_mcp --repo-path=%%REPO_PATH%% %%2 %%3 %%4 %%5 %%6 %%7 %%8 %%9 >> git-mcp-wrapper.bat
    
    echo [SUCCESS] Created Git MCP wrapper script: git-mcp-wrapper.bat
    echo [SUCCESS] Created Git MCP wrapper script: git-mcp-wrapper.bat >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Fix Semgrep MCP
echo Fixing Semgrep MCP...
echo Fixing Semgrep MCP... >> %LOG_FILE%
echo Installing Semgrep...
echo Installing Semgrep... >> %LOG_FILE%
pip install semgrep >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Failed to install Semgrep.
    echo [WARNING] Failed to install Semgrep. >> %LOG_FILE%
    echo Please install Semgrep manually: pip install semgrep
    echo Please install Semgrep manually: pip install semgrep >> %LOG_FILE%
) else (
    echo [SUCCESS] Semgrep installed.
    echo [SUCCESS] Semgrep installed. >> %LOG_FILE%
    
    REM Add Python Scripts to PATH
    echo Adding Python Scripts to PATH...
    echo Adding Python Scripts to PATH... >> %LOG_FILE%
    setx PATH "%PATH%;%USERPROFILE%\AppData\Roaming\Python\Python313\Scripts" >> %LOG_FILE% 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Failed to add Python Scripts to PATH.
        echo [WARNING] Failed to add Python Scripts to PATH. >> %LOG_FILE%
        echo Please add %USERPROFILE%\AppData\Roaming\Python\Python313\Scripts to your PATH manually.
        echo Please add %USERPROFILE%\AppData\Roaming\Python\Python313\Scripts to your PATH manually. >> %LOG_FILE%
    ) else (
        echo [SUCCESS] Python Scripts added to PATH.
        echo [SUCCESS] Python Scripts added to PATH. >> %LOG_FILE%
    )
)
echo. >> %LOG_FILE%

REM Fix Magic MCP
echo Fixing Magic MCP...
echo Fixing Magic MCP... >> %LOG_FILE%
echo Magic MCP requires an API key from https://21st.dev/magic/console
echo Magic MCP requires an API key from https://21st.dev/magic/console >> %LOG_FILE%
echo Creating a placeholder for Magic MCP API key...
echo Creating a placeholder for Magic MCP API key... >> %LOG_FILE%

echo // Magic MCP API Key Configuration > magic-mcp-config.js
echo // Get your API key from https://21st.dev/magic/console >> magic-mcp-config.js
echo const MAGIC_API_KEY = "YOUR_API_KEY_HERE"; >> magic-mcp-config.js
echo. >> magic-mcp-config.js
echo // To use Magic MCP with this API key: >> magic-mcp-config.js
echo // 1. Replace YOUR_API_KEY_HERE with your actual API key >> magic-mcp-config.js
echo // 2. Run: node magic-mcp-config.js >> magic-mcp-config.js
echo. >> magic-mcp-config.js
echo console.log("Magic MCP API key configured!"); >> magic-mcp-config.js

echo [SUCCESS] Created Magic MCP configuration file: magic-mcp-config.js
echo [SUCCESS] Created Magic MCP configuration file: magic-mcp-config.js >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Fix SQLite MCP
echo Fixing SQLite MCP...
echo Fixing SQLite MCP... >> %LOG_FILE%
echo Checking if SQLite is installed...
echo Checking if SQLite is installed... >> %LOG_FILE%
sqlite3 --version >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] SQLite is not installed or not in PATH.
    echo [WARNING] SQLite is not installed or not in PATH. >> %LOG_FILE%
    echo Please install SQLite from https://www.sqlite.org/download.html
    echo Please install SQLite from https://www.sqlite.org/download.html >> %LOG_FILE%
) else (
    echo [SUCCESS] SQLite is installed.
    echo [SUCCESS] SQLite is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Create a test database for SQLite MCP
echo Creating a test database for SQLite MCP...
echo Creating a test database for SQLite MCP... >> %LOG_FILE%
echo .open test.db > sqlite-test-commands.sql
echo CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, name TEXT); >> sqlite-test-commands.sql
echo INSERT INTO test_table (name) VALUES ('Test Entry'); >> sqlite-test-commands.sql
echo SELECT * FROM test_table; >> sqlite-test-commands.sql
echo .quit >> sqlite-test-commands.sql

sqlite3 < sqlite-test-commands.sql >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Failed to create test database.
    echo [WARNING] Failed to create test database. >> %LOG_FILE%
) else (
    echo [SUCCESS] Created test database: test.db
    echo [SUCCESS] Created test database: test.db >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo ===================================================
echo Fix Complete!
echo ===================================================
echo.
echo Check %LOG_FILE% for details.
echo.
echo Next Steps:
echo 1. For Magic MCP: Get an API key from https://21st.dev/magic/console
echo 2. For Git MCP: Use git-mcp-wrapper.bat instead of calling Git MCP directly
echo 3. For Semgrep MCP: Restart your command prompt to apply PATH changes
echo 4. For SQLite MCP: Use test.db as your test database
echo.
echo Press any key to exit...
pause > nul
