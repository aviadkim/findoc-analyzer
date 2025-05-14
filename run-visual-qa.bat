@echo off
echo Starting Visual QA Test for FinDoc Analyzer

echo Launching visual browser test to run a complete QA suite...
echo This will open a browser window and perform automated testing
echo All actions will be visible and screenshots will be saved

node visual-qa-test.js

echo Test completed! Check qa-test-results folder for detailed report
echo Open the visual-test-report.html file in a browser to see results