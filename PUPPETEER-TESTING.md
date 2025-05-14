# FinDoc Analyzer Puppeteer Testing Guide

This document explains how to use the Puppeteer testing framework to test the FinDoc Analyzer application.

## Overview

The Puppeteer testing framework provides a comprehensive way to test the FinDoc Analyzer application, including:

- Document upload and processing
- Document chat functionality
- Navigation between pages
- Error handling
- UI element verification

Tests can be run against both local and cloud deployments, with or without API keys for testing AI capabilities.

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- The following npm packages:
  - puppeteer
  - axios

## Installation

If you haven't installed the required packages, you can do so by running:

```bash
npm install puppeteer axios
```

The test runner scripts will attempt to install these automatically if they're not found.

## Running Tests

### Using the Test Runner Scripts

We provide two scripts for running tests:

- `run-puppeteer-tests.bat` (Windows)
- `run-puppeteer-tests.sh` (Linux/Mac)

These scripts simplify the process of running tests with different configurations.

#### Examples

**Testing local deployment only:**

```bash
# Windows
run-puppeteer-tests.bat --local

# Linux/Mac
./run-puppeteer-tests.sh --local
```

**Testing cloud deployment only:**

```bash
# Windows
run-puppeteer-tests.bat --cloud https://findoc-deploy.ey.r.appspot.com

# Linux/Mac
./run-puppeteer-tests.sh --cloud https://findoc-deploy.ey.r.appspot.com
```

**Testing both local and cloud deployments:**

```bash
# Windows
run-puppeteer-tests.bat --both https://findoc-deploy.ey.r.appspot.com

# Linux/Mac
./run-puppeteer-tests.sh --both https://findoc-deploy.ey.r.appspot.com
```

**Running in non-headless mode (to see the browser):**

```bash
# Windows
run-puppeteer-tests.bat --headless false

# Linux/Mac
./run-puppeteer-tests.sh --headless false
```

**Without creating sample documents:**

```bash
# Windows
run-puppeteer-tests.bat --no-samples

# Linux/Mac
./run-puppeteer-tests.sh --no-samples
```

### Running Tests Directly

You can also run the tests directly without using the provided scripts:

```bash
node fintest-puppeteer.js --url http://localhost:8080 --headless true --results-dir ./test-results
```

#### Command Line Options

- `--url, -u <url>`: Base URL for the application (default: http://localhost:8080)
- `--headless, -h <true|false>`: Run in headless mode (default: true)
- `--results-dir, -r <path>`: Directory for storing test results (default: ./test-results)
- `--sample-pdf, -p <path>`: Path to sample PDF for upload tests (default: ./test-data/sample.pdf)
- `--create-samples, -c <true|false>`: Create sample documents before testing (default: true)
- `--timeout, -t <ms>`: Default timeout in milliseconds (default: 30000)
- `--openai-key <key>`: OpenAI API key for testing
- `--anthropic-key <key>`: Anthropic API key for testing
- `--gemini-key <key>`: Gemini API key for testing
- `--help`: Show help message

### Using API Keys for Testing

To test AI chat capabilities, you can provide API keys:

```bash
# Windows
run-puppeteer-tests.bat --openai-key sk-your-key-here --anthropic-key sk-ant-your-key-here

# Linux/Mac
./run-puppeteer-tests.sh --openai-key sk-your-key-here --anthropic-key sk-ant-your-key-here
```

Alternatively, you can set these as environment variables:

```bash
# Windows
set OPENAI_API_KEY=sk-your-key-here
set ANTHROPIC_API_KEY=sk-ant-your-key-here
run-puppeteer-tests.bat

# Linux/Mac
export OPENAI_API_KEY=sk-your-key-here
export ANTHROPIC_API_KEY=sk-ant-your-key-here
./run-puppeteer-tests.sh
```

## Test Reports

After running the tests, a comprehensive HTML report will be generated in the specified results directory. The report includes:

- Summary of test results
- Test suite details
- Individual test results with status (passed, failed, skipped)
- Screenshots of each test step
- Error details for failed tests
- Console logs and network errors

The report will be saved to:
- `./test-results/local/test-report.html` (for local tests)
- `./test-results/cloud/test-report.html` (for cloud tests)

Additionally, detailed test results are saved as JSON at:
- `./test-results/local/test-results.json` (for local tests)
- `./test-results/cloud/test-results.json` (for cloud tests)

## Docker Integration

If you're using Docker, you can run tests against a Docker deployment:

```bash
# Start the Docker container
docker-compose up -d

# Wait for the container to start
sleep 5

# Run tests against the Docker deployment
./run-puppeteer-tests.sh --cloud http://localhost:8080
```

## Continuous Integration

The testing framework can be integrated into CI/CD pipelines. For example, in GitHub Actions:

```yaml
name: Puppeteer Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Start server
      run: node server.js &
      
    - name: Wait for server to start
      run: sleep 5
    
    - name: Run Puppeteer tests
      run: node fintest-puppeteer.js --headless true
    
    - name: Upload test results
      uses: actions/upload-artifact@v2
      with:
        name: test-results
        path: test-results
```

## Troubleshooting

### Tests are failing on WSL

If you're running tests in WSL and experiencing issues with Puppeteer, you may need to install additional dependencies:

```bash
sudo apt-get update
sudo apt-get install -y wget gnupg ca-certificates
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
sudo apt-get update
sudo apt-get install -y google-chrome-stable
```

### Browser isn't showing in non-headless mode

Make sure you have an X server running if you're using WSL or a headless server. For WSL2, you can use VcXsrv or another X server.

### Tests are timing out

If tests are timing out, you can increase the timeout values:

```bash
node fintest-puppeteer.js --timeout 60000 --navigation-timeout 60000
```

### API tests pass but UI tests fail

This may indicate an issue with the UI routing or element selectors. Check the test report for specific error messages and screenshots to diagnose the issue.

## Extending the Tests

### Adding New Tests

You can extend the testing framework by adding new tests to the `fintest-puppeteer.js` file. Look for the `runAllTests` method in the `TestRunner` class, and add your new tests there.

Example:

```javascript
await this.runTest(this.uiSuite, 'My New Test', async (page, runner) => {
  await runner.navigateTo('/my-new-page');
  await runner.waitForElement('.my-element');
  await runner.clickElement('.my-button');
  
  // Verify the result
  const text = await runner.getElementText('.result-text');
  if (!text.includes('Expected result')) {
    throw new Error('Test failed: Expected result not found');
  }
});
```

### Customizing Selectors

The selectors used in tests can be customized by modifying the `config.selectors` object at the top of the `fintest-puppeteer.js` file.

## Best Practices

1. **Run tests locally first** before testing cloud deployments.
2. **Use realistic test data** that mimics real-world usage.
3. **Test error conditions** as well as happy paths.
4. **Review test reports** to identify patterns in failures.
5. **Keep tests independent** so they can run in any order.
6. **Clean up after tests** to prevent test pollution.
7. **Use descriptive test names** that clearly indicate what's being tested.
8. **Set reasonable timeouts** based on your application's performance.

## Conclusion

The Puppeteer testing framework provides a robust way to test the FinDoc Analyzer application across different environments. By following this guide, you can ensure that your application works correctly on both local and cloud deployments.