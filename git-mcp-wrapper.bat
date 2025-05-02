@echo off 
set REPO_PATH=%1 
if "%REPO_PATH%"=="." set REPO_PATH=C:\Users\aviad\OneDrive\Desktop\backv2-main 
python -m git_mcp --repo-path=%REPO_PATH% %2 %3 %4 %5 %6 %7 %8 %9 
