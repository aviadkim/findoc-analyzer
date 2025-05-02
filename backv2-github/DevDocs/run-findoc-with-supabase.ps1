# Run FinDoc with Supabase

# Start the backend
Start-Process -FilePath "powershell" -ArgumentList "-ExecutionPolicy Bypass -File .\findoc-app-engine-v2\run-app.ps1" -NoNewWindow

# Wait for the backend to start
Start-Sleep -Seconds 5

# Start the frontend
Start-Process -FilePath "http://localhost:3000" -WindowStyle Normal

# Keep the script running
Write-Host "FinDoc is running. Press Ctrl+C to stop."
while ($true) {
    Start-Sleep -Seconds 1
}
