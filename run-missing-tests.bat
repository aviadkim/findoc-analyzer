@echo off
echo Starting Missing Components Analysis

echo This analysis will identify components needing improvement...
echo Running full application test suite...

setlocal EnableDelayedExpansion

set "COMPONENTS_TOTAL=0"
set "COMPONENTS_MISSING=0"

echo.
echo ===== HOME PAGE COMPONENT ANALYSIS =====
echo.
set "TOTAL=0"
set "MISSING=0"

REM Check homepage components
set /a TOTAL+=1
echo Checking Process Button on Homepage...
node -e "const http = require('http'); const opts = { hostname: 'localhost', port: 8080, path: '/', method: 'GET' }; const req = http.request(opts, res => { let data = ''; res.on('data', chunk => { data += chunk; }); res.on('end', () => { const hasComponent = data.includes('process-document-btn') || data.includes('Process Document'); if (hasComponent) { console.log('FOUND: Process Button on Homepage'); } else { console.log('MISSING: Process Button on Homepage'); } }); }); req.on('error', error => { console.error('Error: ', error); }); req.end();"
REM Count missing components
findstr /C:"MISSING" /B /I < nul 2>nul || set /a MISSING+=1

set /a TOTAL+=1
echo Checking Chat Button on Homepage...
node -e "const http = require('http'); const opts = { hostname: 'localhost', port: 8080, path: '/', method: 'GET' }; const req = http.request(opts, res => { let data = ''; res.on('data', chunk => { data += chunk; }); res.on('end', () => { const hasComponent = data.includes('show-chat-btn') || data.includes('Chat'); if (hasComponent) { console.log('FOUND: Chat Button on Homepage'); } else { console.log('MISSING: Chat Button on Homepage'); } }); }); req.on('error', error => { console.error('Error: ', error); }); req.end();"
REM Count missing components
findstr /C:"MISSING" /B /I < nul 2>nul || set /a MISSING+=1

echo.
echo Homepage Analysis: !MISSING! of !TOTAL! components missing

REM Update total counts
set /a COMPONENTS_TOTAL+=TOTAL
set /a COMPONENTS_MISSING+=MISSING

echo.
echo ===== UPLOAD PAGE COMPONENT ANALYSIS =====
echo.
set "TOTAL=0"
set "MISSING=0"

REM Check upload page components
set /a TOTAL+=1
echo Checking Process Button on Upload Page...
node -e "const http = require('http'); const opts = { hostname: 'localhost', port: 8080, path: '/upload', method: 'GET' }; const req = http.request(opts, res => { let data = ''; res.on('data', chunk => { data += chunk; }); res.on('end', () => { const hasComponent = data.includes('process-document-btn') || data.includes('Process Document'); if (hasComponent) { console.log('FOUND: Process Button on Upload Page'); } else { console.log('MISSING: Process Button on Upload Page'); } }); }); req.on('error', error => { console.error('Error: ', error); }); req.end();"
REM Count missing components
findstr /C:"MISSING" /B /I < nul 2>nul || set /a MISSING+=1

set /a TOTAL+=1
echo Checking Chat Container on Upload Page...
node -e "const http = require('http'); const opts = { hostname: 'localhost', port: 8080, path: '/upload', method: 'GET' }; const req = http.request(opts, res => { let data = ''; res.on('data', chunk => { data += chunk; }); res.on('end', () => { const hasComponent = data.includes('document-chat-container') || data.includes('chat-container'); if (hasComponent) { console.log('FOUND: Chat Container on Upload Page'); } else { console.log('MISSING: Chat Container on Upload Page'); } }); }); req.on('error', error => { console.error('Error: ', error); }); req.end();"
REM Count missing components
findstr /C:"MISSING" /B /I < nul 2>nul || set /a MISSING+=1

set /a TOTAL+=1
echo Checking File Input on Upload Page...
node -e "const http = require('http'); const opts = { hostname: 'localhost', port: 8080, path: '/upload', method: 'GET' }; const req = http.request(opts, res => { let data = ''; res.on('data', chunk => { data += chunk; }); res.on('end', () => { const hasComponent = data.includes('file-input') || data.includes('input type=\"file\"'); if (hasComponent) { console.log('FOUND: File Input on Upload Page'); } else { console.log('MISSING: File Input on Upload Page'); } }); }); req.on('error', error => { console.error('Error: ', error); }); req.end();"
REM Count missing components
findstr /C:"MISSING" /B /I < nul 2>nul || set /a MISSING+=1

echo.
echo Upload Page Analysis: !MISSING! of !TOTAL! components missing

REM Update total counts
set /a COMPONENTS_TOTAL+=TOTAL
set /a COMPONENTS_MISSING+=MISSING

echo.
echo ===== DOCUMENTS PAGE COMPONENT ANALYSIS =====
echo.
set "TOTAL=0"
set "MISSING=0"

REM Check documents page components
set /a TOTAL+=1
echo Checking Document Cards on Documents Page...
node -e "const http = require('http'); const opts = { hostname: 'localhost', port: 8080, path: '/documents-new', method: 'GET' }; const req = http.request(opts, res => { let data = ''; res.on('data', chunk => { data += chunk; }); res.on('end', () => { const hasComponent = data.includes('document-card') || data.includes('document-list'); if (hasComponent) { console.log('FOUND: Document Cards on Documents Page'); } else { console.log('MISSING: Document Cards on Documents Page'); } }); }); req.on('error', error => { console.error('Error: ', error); }); req.end();"
REM Count missing components
findstr /C:"MISSING" /B /I < nul 2>nul || set /a MISSING+=1

echo.
echo Documents Page Analysis: !MISSING! of !TOTAL! components missing

REM Update total counts
set /a COMPONENTS_TOTAL+=TOTAL
set /a COMPONENTS_MISSING+=MISSING

echo.
echo ===== OVERALL ANALYSIS SUMMARY =====
echo.
echo Total Components Checked: !COMPONENTS_TOTAL!
echo Components Found: !COMPONENTS_TOTAL!-!COMPONENTS_MISSING!=!COMPONENTS_TOTAL!-!COMPONENTS_MISSING!
echo Components Missing: !COMPONENTS_MISSING!
echo Success Rate: 

REM Calculate success rate
if !COMPONENTS_TOTAL! NEQ 0 (
  set /a SUCCESS_PERCENT=100-(!COMPONENTS_MISSING!*100/!COMPONENTS_TOTAL!)
  echo !SUCCESS_PERCENT!%%
) else (
  echo N/A
)

echo.
echo Missing Component Analysis Complete! 
if !COMPONENTS_MISSING! EQU 0 (
  echo All UI components are present and working correctly.
) else (
  echo Some UI components need attention. See above for details.
)

endlocal