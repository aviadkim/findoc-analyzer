@echo off
echo Installing QA Test Dependencies...

REM Install Playwright
npm install --no-save playwright@latest

REM Install axios for API calls
npm install --no-save axios@latest

REM Install Playwright browsers
npx playwright install chromium

echo QA Test Dependencies installed successfully!