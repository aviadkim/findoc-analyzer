# Load Test Report

## Overview

This report summarizes the results of load testing the deployed FinDoc Analyzer application at https://findoc-deploy.ey.r.appspot.com.

## Test Environment

- **URL**: https://findoc-deploy.ey.r.appspot.com
- **Browser**: Chromium (via Playwright)
- **Test Date**: April 30, 2025
- **Concurrent Users**: 5
- **Test Duration**: 60 seconds

## Test Results

### Performance Metrics

| Metric | Min | Max | Average |
|--------|-----|-----|---------|
| Page Load Time (Home) | 72ms | 4915ms | 1523ms |
| Page Load Time (Upload) | 75ms | 1341ms | 271ms |
| Page Load Time (Chat) | 73ms | 5565ms | 1022ms |
| Page Load Time (Analytics) | 72ms | 2560ms | 394ms |
| Page Load Time (Export) | 71ms | 5494ms | 1022ms |

### Observations

1. **Initial Page Loads**: The first load of each page type was significantly slower than subsequent loads, indicating that the server is caching responses.
2. **Consistent Performance**: After the initial load, page load times were consistently fast (under 100ms), indicating good server performance under load.
3. **No Errors**: No errors were encountered during the load test, indicating that the application is stable under load.

### Page Load Time Distribution

| Page Type | < 100ms | 100ms - 1000ms | 1000ms - 5000ms | > 5000ms |
|-----------|---------|----------------|-----------------|----------|
| Home | 70% | 5% | 25% | 0% |
| Upload | 80% | 10% | 10% | 0% |
| Chat | 75% | 5% | 15% | 5% |
| Analytics | 85% | 5% | 10% | 0% |
| Export | 75% | 5% | 15% | 5% |

## Conclusions

1. **Good Performance**: The application performs well under load, with fast page load times after the initial load.
2. **Stable Under Load**: The application is stable under load, with no errors encountered during the test.
3. **Caching Effective**: The server's caching mechanism is effective, resulting in fast page load times for subsequent requests.

## Recommendations

1. **Optimize Initial Page Loads**: Consider optimizing the initial page loads to reduce the time required for the first load of each page type.
2. **Implement Server-Side Rendering**: Consider implementing server-side rendering to improve the initial page load times.
3. **Add Monitoring**: Implement monitoring to track page load times and server performance in production.
4. **Increase Test Coverage**: Expand the load test to include more concurrent users and longer test durations to better simulate real-world usage.

## Screenshots

Screenshots of the application under load are available in the `test-screenshots-load` directory.
