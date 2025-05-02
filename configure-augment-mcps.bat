@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Augment MCP Configuration
echo ===================================================
echo.

set GLOBAL_MCP_DIR=C:\Users\aviad\.mcp-servers
set LOG_FILE=augment-mcp-configuration.log

echo Augment MCP Configuration > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Find Augment settings file
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

if !AUGMENT_SETTINGS_FOUND! EQU 0 (
    echo [ERROR] Could not find Augment settings file.
    echo [ERROR] Could not find Augment settings file. >> %LOG_FILE%
    echo Please locate your Augment settings file and update the script.
    echo.
    echo Press any key to exit...
    pause > nul
    exit /b 1
)

REM Create a backup of the settings file
echo Creating backup of Augment settings file...
echo Creating backup of Augment settings file... >> %LOG_FILE%
copy "%AUGMENT_SETTINGS_FILE%" "%AUGMENT_SETTINGS_FILE%.bak" > nul
echo [SUCCESS] Backup created: %AUGMENT_SETTINGS_FILE%.bak
echo [SUCCESS] Backup created: %AUGMENT_SETTINGS_FILE%.bak >> %LOG_FILE%
echo. >> %LOG_FILE%

echo Generating MCP configuration...
echo Generating MCP configuration... >> %LOG_FILE%

REM Create a temporary file for the new configuration
set TEMP_CONFIG_FILE=%TEMP%\augment-mcp-config-%RANDOM%.json
echo { > %TEMP_CONFIG_FILE%
echo   "mcpServers": { >> %TEMP_CONFIG_FILE%

REM Add JavaScript MCPs
set FIRST_MCP=1
for %%f in (%GLOBAL_MCP_DIR%\js\*.js) do (
    set MCP_NAME=%%~nf
    set MCP_NAME=!MCP_NAME:-=_!
    if !FIRST_MCP! EQU 0 (
        echo , >> %TEMP_CONFIG_FILE%
    ) else (
        set FIRST_MCP=0
    )
    echo     "!MCP_NAME!": { >> %TEMP_CONFIG_FILE%
    echo       "autoApprove": [], >> %TEMP_CONFIG_FILE%
    echo       "disabled": false, >> %TEMP_CONFIG_FILE%
    echo       "timeout": 60, >> %TEMP_CONFIG_FILE%
    echo       "command": "node", >> %TEMP_CONFIG_FILE%
    echo       "args": [ >> %TEMP_CONFIG_FILE%
    echo         "%GLOBAL_MCP_DIR%\js\%%~nxf" >> %TEMP_CONFIG_FILE%
    echo       ], >> %TEMP_CONFIG_FILE%
    echo       "transportType": "stdio" >> %TEMP_CONFIG_FILE%
    echo     } >> %TEMP_CONFIG_FILE%
    echo [ADDED] !MCP_NAME! (JavaScript) >> %LOG_FILE%
)

REM Add Python MCPs
for %%f in (%GLOBAL_MCP_DIR%\py\*.py) do (
    if not "%%~nxf"=="setup.py" (
        if not "%%~nxf"=="mcp_template.py" (
            set MCP_NAME=%%~nf
            set MCP_NAME=!MCP_NAME:-=_!
            echo , >> %TEMP_CONFIG_FILE%
            echo     "!MCP_NAME!": { >> %TEMP_CONFIG_FILE%
            echo       "autoApprove": [], >> %TEMP_CONFIG_FILE%
            echo       "disabled": false, >> %TEMP_CONFIG_FILE%
            echo       "timeout": 60, >> %TEMP_CONFIG_FILE%
            echo       "command": "python", >> %TEMP_CONFIG_FILE%
            echo       "args": [ >> %TEMP_CONFIG_FILE%
            echo         "-m", >> %TEMP_CONFIG_FILE%
            echo         "%%~nf" >> %TEMP_CONFIG_FILE%
            echo       ], >> %TEMP_CONFIG_FILE%
            echo       "transportType": "stdio" >> %TEMP_CONFIG_FILE%
            echo     } >> %TEMP_CONFIG_FILE%
            echo [ADDED] !MCP_NAME! (Python) >> %LOG_FILE%
        )
    )
)

REM Add TypeScript MCPs
for %%f in (%GLOBAL_MCP_DIR%\ts\*.ts) do (
    set MCP_NAME=%%~nf
    set MCP_NAME=!MCP_NAME:-=_!
    echo , >> %TEMP_CONFIG_FILE%
    echo     "!MCP_NAME!": { >> %TEMP_CONFIG_FILE%
    echo       "autoApprove": [], >> %TEMP_CONFIG_FILE%
    echo       "disabled": false, >> %TEMP_CONFIG_FILE%
    echo       "timeout": 60, >> %TEMP_CONFIG_FILE%
    echo       "command": "ts-node", >> %TEMP_CONFIG_FILE%
    echo       "args": [ >> %TEMP_CONFIG_FILE%
    echo         "%GLOBAL_MCP_DIR%\ts\%%~nxf" >> %TEMP_CONFIG_FILE%
    echo       ], >> %TEMP_CONFIG_FILE%
    echo       "transportType": "stdio" >> %TEMP_CONFIG_FILE%
    echo     } >> %TEMP_CONFIG_FILE%
    echo [ADDED] !MCP_NAME! (TypeScript) >> %LOG_FILE%
)

echo   } >> %TEMP_CONFIG_FILE%
echo } >> %TEMP_CONFIG_FILE%

echo [SUCCESS] Generated MCP configuration.
echo [SUCCESS] Generated MCP configuration. >> %LOG_FILE%
echo. >> %LOG_FILE%

echo Do you want to update the Augment settings file with this configuration? (Y/N)
set /p CONFIRM=
if /i "%CONFIRM%" NEQ "Y" (
    echo Operation cancelled by user.
    echo Operation cancelled by user. >> %LOG_FILE%
    echo The generated configuration is available at: %TEMP_CONFIG_FILE%
    echo.
    echo Press any key to exit...
    pause > nul
    exit /b 0
)

echo Updating Augment settings file...
echo Updating Augment settings file... >> %LOG_FILE%
copy %TEMP_CONFIG_FILE% "%AUGMENT_SETTINGS_FILE%" > nul
echo [SUCCESS] Augment settings file updated.
echo [SUCCESS] Augment settings file updated. >> %LOG_FILE%
echo. >> %LOG_FILE%

echo ===================================================
echo Configuration Complete!
echo ===================================================
echo.
echo Your Augment has been configured to use the global MCPs.
echo A backup of your original settings has been saved to:
echo %AUGMENT_SETTINGS_FILE%.bak
echo.
echo Please restart Augment for the changes to take effect.
echo.
echo Press any key to exit...
pause > nul
