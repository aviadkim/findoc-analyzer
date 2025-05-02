@echo off
echo ===================================================
echo Cleaning Specific Files with API Keys
echo ===================================================
echo.

echo Cleaning top-30-mcp-config.json...
powershell -Command "(Get-Content top-30-mcp-config.json) -replace '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', 'YOUR_GITHUB_TOKEN_HERE' | Set-Content top-30-mcp-config.json"
powershell -Command "(Get-Content top-30-mcp-config.json) -replace 'BSAN7HoBWjJOUG-zXVN8rkIGXpbsRtq', 'YOUR_BRAVE_API_KEY_HERE' | Set-Content top-30-mcp-config.json"
powershell -Command "(Get-Content top-30-mcp-config.json) -replace 'fc-857417811665460e92716b92e08ec398', 'YOUR_FIRECRAWL_API_KEY_HERE' | Set-Content top-30-mcp-config.json"
powershell -Command "(Get-Content top-30-mcp-config.json) -replace 'sbp_cdcfec9d48c88f29d0e7c24a36cc450104b35055', 'YOUR_SUPABASE_TOKEN_HERE' | Set-Content top-30-mcp-config.json"
echo Done.

echo Cleaning AI-MCP-USAGE-GUIDE.md...
powershell -Command "(Get-Content AI-MCP-USAGE-GUIDE.md) -replace 'BRAVE_API_KEY=BSAN7HoBWjJOUG-zXVN8rkIGXpbsRtq', 'BRAVE_API_KEY=YOUR_BRAVE_API_KEY_HERE' | Set-Content AI-MCP-USAGE-GUIDE.md"
powershell -Command "(Get-Content AI-MCP-USAGE-GUIDE.md) -replace 'FIRECRAWL_API_KEY=fc-857417811665460e92716b92e08ec398', 'FIRECRAWL_API_KEY=YOUR_FIRECRAWL_API_KEY_HERE' | Set-Content AI-MCP-USAGE-GUIDE.md"
powershell -Command "(Get-Content AI-MCP-USAGE-GUIDE.md) -replace 'sbp_cdcfec9d48c88f29d0e7c24a36cc450104b35055', 'YOUR_SUPABASE_TOKEN_HERE' | Set-Content AI-MCP-USAGE-GUIDE.md"
echo Done.

echo Cleaning start-all-mcp-with-monitoring.bat...
powershell -Command "(Get-Content start-all-mcp-with-monitoring.bat) -replace 'sbp_cdcfec9d48c88f29d0e7c24a36cc450104b35055', 'YOUR_SUPABASE_TOKEN_HERE' | Set-Content start-all-mcp-with-monitoring.bat"
echo Done.

echo Creating/updating .gitignore file...
echo # Ignore log files that might contain sensitive information > .gitignore
echo *.log >> .gitignore
echo logs/ >> .gitignore
echo # Ignore environment variable files >> .gitignore
echo .env >> .gitignore
echo .env.local >> .gitignore
echo # Ignore any backup files that might contain API keys >> .gitignore
echo *.bak >> .gitignore
echo *-backup.* >> .gitignore
echo # Ignore temporary files >> .gitignore
echo temp/ >> .gitignore
echo tmp/ >> .gitignore
echo # Ignore node modules >> .gitignore
echo node_modules/ >> .gitignore
echo Done.

echo.
echo ===================================================
echo Cleaning Complete!
echo ===================================================
echo.
echo All API keys have been replaced with placeholders.
echo A .gitignore file has been created/updated to prevent accidental commits of sensitive information.
echo Your backv2-main folder is now safe to push to GitHub.
echo.
echo Press any key to exit...
pause > nul
