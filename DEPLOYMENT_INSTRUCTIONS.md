# Deployment Instructions for FinDoc Analyzer

## Overview

This document provides step-by-step instructions for deploying the FinDoc Analyzer application to Google App Engine, including how to test UI components to ensure they render correctly in the deployed environment.

## Prerequisites

1. **Google Cloud SDK**: Install from [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
2. **Node.js and npm**: Install from [https://nodejs.org/](https://nodejs.org/)
3. **Puppeteer** (for testing): Install globally with `npm install -g puppeteer`
4. **Google Cloud Account**: You need an account with access to Google Cloud and permission to deploy to App Engine

## Deployment Scripts

The repository includes the following deployment-related scripts:

1. **deploy-to-app-engine.sh**: Deploys the application to Google App Engine
2. **test-ui-components.sh**: Tests UI components on the deployed application
3. **run-dashboard.sh**: Interactive dashboard for deployment and testing
4. **fix-deployed-ui.js**: Script to identify and fix UI issues

## Deployment Steps

### Option 1: Using the Dashboard (Recommended)

1. Open a terminal and navigate to the project root directory
2. Run the dashboard script:
   ```bash
   ./run-dashboard.sh
   ```
3. Select option 1 to deploy to Google App Engine
4. After deployment, select option 2 to test UI components
5. Select option 3 to view test results

### Option 2: Manual Deployment

1. Open a terminal and navigate to the project root directory
2. Run the deployment script:
   ```bash
   ./deploy-to-app-engine.sh
   ```
3. After deployment completes, run the UI tests:
   ```bash
   ./test-ui-components.sh https://your-app-id.appspot.com
   ```

## Testing the Deployment

After deploying, you should test the application to ensure all UI components are rendering correctly:

1. Check the home page for the chat button
2. Check the upload page for the process button and file upload form
3. Check the documents page for document cards
4. Check the document chat page for chat functionality

You can use the automated test script to verify these components:

```bash
./test-ui-components.sh https://your-app-id.appspot.com
```

The script generates a test report in the `ui-test-results` directory, including screenshots and a detailed HTML report.

## Troubleshooting

If UI components are not rendering correctly:

1. Check the browser console for JavaScript errors
2. Verify that the middleware is injecting the components correctly
3. Check the network tab for failed resource loads
4. Run the test script to identify specific issues
5. If needed, modify the `middleware/simple-injector.js` file to enhance component injection

Common issues and solutions:

 < /dev/null |  Issue | Solution |
|-------|----------|
| Process button not visible | Check that `direct-process-button-injector.js` is included and the HTML is being injected |
| Chat button not working | Verify that chat container HTML is injected and the click handler is registered |
| Styling inconsistencies | Add more inline styling to the injected HTML components |
| JavaScript errors | Check browser console and fix any syntax or reference errors |

## Monitoring

After deployment, monitor the application:

1. Check the Google Cloud Console for logs and errors
2. Monitor the application's health using Cloud Monitoring
3. Set up alerts for any critical errors

## Rollback Procedure

If the deployment causes issues:

1. Rollback to previous version in Google Cloud Console:
   ```bash
   gcloud app versions list
   gcloud app services set-traffic default --splits=VERSION_ID=1
   ```

2. Or deploy a previous known-good version:
   ```bash
   git checkout <previous-commit>
   ./deploy-to-app-engine.sh
   ```

## Security Considerations

- The application uses HTTPS by default on App Engine
- Environment variables containing sensitive values should be stored in `secret.yaml`
- Regular security scans should be performed

## Conclusion

Following these instructions should result in a successful deployment of the FinDoc Analyzer application to Google App Engine with all UI components rendering correctly.

For any issues or questions, please contact the development team.
