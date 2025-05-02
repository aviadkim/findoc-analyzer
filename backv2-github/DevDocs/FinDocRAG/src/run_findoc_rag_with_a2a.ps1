# Run FinDocRAG with A2A Server
# This script runs both the main FinDocRAG app and the A2A server

# Start the A2A server in a new window
Start-Process -FilePath "powershell" -ArgumentList "-ExecutionPolicy Bypass -Command `"cd '$PSScriptRoot'; python run_a2a_server.py --port 5001`"" -WindowStyle Normal

# Wait for the A2A server to start
Write-Host "Starting A2A server..."
Start-Sleep -Seconds 3

# Start the main app in the current window
Write-Host "Starting main app..."
python app.py
