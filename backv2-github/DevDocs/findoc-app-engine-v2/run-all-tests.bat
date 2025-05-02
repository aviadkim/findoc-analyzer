@echo off
echo Running all PDF processing tests...

:: Step 1: Generate test PDFs
node generate-test-pdfs.js

:: Step 2: Run the tests
node run-tests.js

:: Step 3: Generate HTML report
node generate-html-report.js

echo All tests completed!
echo Results are available in the test_results directory.
echo.
echo Press any key to exit...
pause > nul
