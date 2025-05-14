#!/bin/bash

# Run FinDoc Analyzer tests
# This script runs all tests available for FinDoc Analyzer

# Set up logging
LOG_DIR="./logs"
mkdir -p $LOG_DIR
TEST_LOG="$LOG_DIR/test-run-$(date +%Y%m%d-%H%M%S).log"

# Echo to both console and log file
log() {
    echo "$@" | tee -a "$TEST_LOG"
}

log "==== Starting FinDoc Analyzer Tests ===="
log "Date: $(date)"
log "Node version: $(node -v)"
log "NPM version: $(npm -v)"
log ""

# Ensure we have required packages
log "Checking required packages..."
npm list node-fetch || npm install node-fetch@2 --no-save

# Run the service-level tests
log "\n==== Running Service Tests ===="
node test-document-chat-implementation.js 2>&1 | tee -a "$TEST_LOG"

# Run the UI tests
log "\n==== Running UI Tests ===="
node run-simple-ui-tests.js 2>&1 | tee -a "$TEST_LOG"

# Check exit code
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
    log "\n==== All Tests Completed Successfully ===="
else
    log "\n==== Tests Failed with Exit Code $EXIT_CODE ===="
fi

log "Test log saved to: $TEST_LOG"
log "Test reports available in: ./test-results/"

# Create index.html to view all test reports
TEST_REPORTS_DIR="./test-results"
INDEX_HTML="$TEST_REPORTS_DIR/index.html"

mkdir -p $TEST_REPORTS_DIR

cat > "$INDEX_HTML" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer Test Reports</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1, h2 {
      color: #2c3e50;
    }
    .reports {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .report {
      margin-bottom: 10px;
      padding: 10px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .timestamp {
      color: #7f8c8d;
      font-style: italic;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer Test Reports</h1>
  <p class="timestamp">Generated: $(date)</p>
  
  <div class="reports">
    <h2>Available Reports</h2>
EOF

# Find all HTML reports
find "$TEST_REPORTS_DIR" -name "*.html" -not -name "index.html" | while read -r file; do
    filename=$(basename "$file")
    modified=$(date -r "$file" "+%Y-%m-%d %H:%M:%S")
    cat >> "$INDEX_HTML" << EOF
    <div class="report">
      <a href="./$filename">$filename</a>
      <div class="timestamp">Modified: $modified</div>
    </div>
EOF
done

# Find all screenshot directories
find "$TEST_REPORTS_DIR" -type d -not -path "$TEST_REPORTS_DIR" | while read -r dir; do
    dirname=$(basename "$dir")
    if [ "$dirname" == "screenshots" ]; then
        cat >> "$INDEX_HTML" << EOF
    <div class="report">
      <a href="./screenshots/">Screenshots</a>
      <div class="timestamp">Modified: $(date -r "$dir" "+%Y-%m-%d %H:%M:%S")</div>
    </div>
EOF
    fi
done

# Close the HTML file
cat >> "$INDEX_HTML" << EOF
  </div>
  
  <h2>Test Logs</h2>
  <div class="reports">
EOF

# Find all log files
find "$LOG_DIR" -name "*.log" | while read -r log_file; do
    log_filename=$(basename "$log_file")
    log_modified=$(date -r "$log_file" "+%Y-%m-%d %H:%M:%S")
    log_size=$(du -h "$log_file" | cut -f1)
    cat >> "$INDEX_HTML" << EOF
    <div class="report">
      <a href="../logs/$log_filename">$log_filename</a>
      <div class="timestamp">Modified: $log_modified | Size: $log_size</div>
    </div>
EOF
done

# Close the HTML file
cat >> "$INDEX_HTML" << EOF
  </div>
</body>
</html>
EOF

log "Test report index created at: $INDEX_HTML"
log "Open this file in a browser to view all test reports"

exit $EXIT_CODE