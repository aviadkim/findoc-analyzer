Write-Host "===================================================
Fixing MCP JavaScript Files
==================================================="

$MCP_DIR = "C:\Users\aviad\OneDrive\Desktop\MCP\mcp-packages\custom-mcps"
$LOG_FILE = "fix-mcp-js-files.log"

"MCP JavaScript Files Fix" | Out-File -FilePath $LOG_FILE
"Timestamp: $(Get-Date)" | Out-File -FilePath $LOG_FILE -Append
"" | Out-File -FilePath $LOG_FILE -Append

Write-Host "Fixing JavaScript files in $MCP_DIR..."
"Fixing JavaScript files in $MCP_DIR..." | Out-File -FilePath $LOG_FILE -Append

$files = Get-ChildItem -Path $MCP_DIR -Filter "*.js"
foreach ($file in $files) {
    Write-Host "Checking $($file.FullName)..."
    "Checking $($file.FullName)..." | Out-File -FilePath $LOG_FILE -Append
    
    try {
        $content = Get-Content -Path $file.FullName
        $newContent = $content -replace '^#/usr/bin/env node', '#!/usr/bin/env node'
        $newContent | Set-Content -Path $file.FullName
        
        Write-Host "[SUCCESS] Fixed $($file.FullName)."
        "[SUCCESS] Fixed $($file.FullName)." | Out-File -FilePath $LOG_FILE -Append
    } catch {
        Write-Host "[FAILED] Failed to fix $($file.FullName)."
        "[FAILED] Failed to fix $($file.FullName)." | Out-File -FilePath $LOG_FILE -Append
        $_.Exception.Message | Out-File -FilePath $LOG_FILE -Append
    }
    
    "" | Out-File -FilePath $LOG_FILE -Append
}

Write-Host "
===================================================
Fix Complete!
===================================================

Fix results have been saved to $LOG_FILE

Next Steps:
1. Run start-augment-mcps.bat to start all MCPs
2. Restart Augment to use the fixed MCPs

Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
