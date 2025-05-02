@echo off
echo Starting TaskMaster AI in standalone mode...

:: Set environment variables
set OPENROUTER_API_KEY=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
set MODEL=anthropic/claude-3-7-sonnet-20250219
set MAX_TOKENS=64000
set TEMPERATURE=0.2
set DEFAULT_SUBTASKS=5
set DEFAULT_PRIORITY=medium

:: Start TaskMaster AI using the standalone script
node run-taskmaster.js

echo TaskMaster AI has exited.
