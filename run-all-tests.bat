@echo off
echo Running all PDF processing tests...

:: Step 1: Set up the test environment
call setup-local-test.bat

:: Step 2: Generate test PDFs
python generate-test-pdf.py

:: Step 3: Run the tests
node run-tests.js

:: Step 4: Generate HTML report
node generate-html-report.js

echo All tests completed!
echo Results are available in the test_results directory.
echo.
echo Press any key to exit...
pause > nul
