#\!/bin/bash
# Script to push changes to GitHub
# Usage: ./push-to-github.sh "Your commit message"

# Ensure we have the latest changes
git pull origin ui-modernization-2025

# Add all changes
git add .

# Commit with message if provided
if [ "$1" \!= "" ]; then
  git commit -m "$1

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
else
  echo "No commit message provided, using default"
  git commit -m "Update FinDoc Analyzer

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
fi

# Push to GitHub
git push origin ui-modernization-2025

echo "Changes pushed to GitHub branch 'ui-modernization-2025'"
