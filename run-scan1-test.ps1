# Run Scan1 Test
# This script runs the scan1 test

# Start the server
Start-Process -FilePath "node" -ArgumentList "server.js" -NoNewWindow

# Wait for the server to start
Start-Sleep -Seconds 5

# Run the test
node test-scan1.js

# Stop the server
Stop-Process -Name "node" -Force
