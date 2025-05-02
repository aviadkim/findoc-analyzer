@echo off
echo Using TaskMaster AI CLI directly...

:: Navigate to the project directory
cd /d %~dp0

:: Run TaskMaster AI CLI commands directly
echo.
echo Available tasks:
task-master-ai list

echo.
echo Task details:
task-master-ai show 3

echo.
echo Press any key to exit...
pause > nul
