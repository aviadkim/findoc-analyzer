@echo off
echo Starting FinDoc Analyzer...

cd findoc-app-engine-v2

rem Set environment variables
set PORT=3000
set NODE_ENV=development
set SUPABASE_URL=https://dnjnsotemnfrjlotgved.supabase.co
set SUPABASE_KEY=your-supabase-key
set JWT_SECRET=your-jwt-secret
set GEMINI_API_KEY=your-gemini-api-key

rem Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

rem Start the application
echo Starting server...
node src/server.js

pause
