@echo off
echo Starting the FinDoc Analyzer application...

REM Start the backend server
echo Starting the backend server...
start cmd /k "cd DevDocs\backend && python app.py"

REM Wait for the backend server to start
timeout /t 5

REM Open the application in the browser
echo Opening the application in the browser...
start http://localhost:24125

echo FinDoc Analyzer is now running!
echo Backend: http://localhost:24125
