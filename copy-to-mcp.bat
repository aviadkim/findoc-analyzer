@echo off
echo Copying MCP installation scripts to MCP folder...
copy /Y install-missing-mcps.bat C:\Users\aviad\OneDrive\Desktop\MCP\install-missing-mcps.bat
copy /Y install-official-mcps.bat C:\Users\aviad\OneDrive\Desktop\MCP\install-official-mcps.bat
echo Done!
echo.
echo To install and test missing MCPs:
echo 1. Navigate to C:\Users\aviad\OneDrive\Desktop\MCP
echo 2. Run install-missing-mcps.bat (for MCPs with the exact names in Augment)
echo 3. Or run install-official-mcps.bat (for official MCP packages)
echo.
echo Press any key to exit...
pause > nul
