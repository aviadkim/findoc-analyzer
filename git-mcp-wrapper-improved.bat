@echo off 
setlocal enabledelayedexpansion 
 
set REPO_PATH=%1 
if "%REPO_PATH%"=="." set REPO_PATH=%CD% 
 
echo Git MCP Wrapper 
echo Repository Path: !REPO_PATH! 
echo. 
 
python -m git_mcp --repo-path="!REPO_PATH!" %2 %3 %4 %5 %6 %7 %8 %9 
