@echo off
echo Starting Custom TaskMaster with OpenRouter API...

:: Set environment variables
set OPENROUTER_API_KEY=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
set MODEL=anthropic/claude-3-7-sonnet-20250219
set MAX_TOKENS=64000
set TEMPERATURE=0.2

:: Run the custom TaskMaster implementation
node custom-taskmaster.js

echo Custom TaskMaster has exited.
