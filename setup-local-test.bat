@echo off
echo Setting up local test environment...

:: Create test directories if they don't exist
if not exist "test_pdfs" mkdir test_pdfs
if not exist "test_results" mkdir test_results

:: Copy the test HTML file to the local server directory
copy "pdf_processing_test.html" "backv2-github\DevDocs\findoc-app-engine-v2\public\"

echo Local test environment setup complete!
echo.
echo To start the local server, run:
echo   cd backv2-github\DevDocs\findoc-app-engine-v2
echo   node app.js
echo.
echo Then open http://localhost:3000/pdf_processing_test.html in your browser.
