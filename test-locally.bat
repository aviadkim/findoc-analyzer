@echo off
echo Testing the implementation locally...

:: Navigate to the project directory
cd /d %~dp0backv2-github\DevDocs

:: Start the server
node app.js

echo Server stopped.
