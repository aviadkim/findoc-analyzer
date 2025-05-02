@echo off
echo Running PDF Processing Tests...

:: Create test directories if they don't exist
if not exist "test_pdfs" mkdir test_pdfs
if not exist "test_results" mkdir test_results

:: Step 1: Generate test PDFs
echo Step 1: Generating test PDFs...
node generate-test-pdfs.js

:: Step 2: Run the tests
echo Step 2: Running tests...
node run-tests.js

:: Step 3: Generate HTML report
echo Step 3: Generating HTML report...
node generate-html-report.js

:: Step 4: Open the report in the browser
echo Step 4: Opening report in browser...
start "" "test_results/report.html"

echo All tests completed!
echo Results are available in the test_results directory.
echo.
echo Press any key to exit...
pause > nul
