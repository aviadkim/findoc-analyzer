@echo off
echo Testing specific UI component with direct HTTP requests
cd %~dp0

echo "Testing for Process Button on Upload Page..."
node -e "const http = require('http'); const opts = { hostname: 'localhost', port: 8080, path: '/upload', method: 'GET' }; const req = http.request(opts, res => { let data = ''; res.on('data', chunk => { data += chunk; }); res.on('end', () => { const hasProcessButton = data.includes('process-document-btn') || data.includes('floating-process-btn') || data.includes('Process Document'); console.log('Process Button Present: ' + (hasProcessButton ? 'YES' : 'NO')); }); }); req.on('error', error => { console.error('Error: ', error); }); req.end();"

echo "Testing for Chat Button on homepage..."
node -e "const http = require('http'); const opts = { hostname: 'localhost', port: 8080, path: '/', method: 'GET' }; const req = http.request(opts, res => { let data = ''; res.on('data', chunk => { data += chunk; }); res.on('end', () => { const hasChatButton = data.includes('show-chat-btn') || data.includes('chat-button') || data.includes('Chat'); console.log('Chat Button Present: ' + (hasChatButton ? 'YES' : 'NO')); }); }); req.on('error', error => { console.error('Error: ', error); }); req.end();"

echo "Testing for Chat Container on Upload Page..."
node -e "const http = require('http'); const opts = { hostname: 'localhost', port: 8080, path: '/upload', method: 'GET' }; const req = http.request(opts, res => { let data = ''; res.on('data', chunk => { data += chunk; }); res.on('end', () => { const hasChatContainer = data.includes('document-chat-container') || data.includes('chat-container'); console.log('Chat Container Present: ' + (hasChatContainer ? 'YES' : 'NO')); }); }); req.on('error', error => { console.error('Error: ', error); }); req.end();"

echo "Tests completed!"