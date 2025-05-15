# API Key Configuration Guide for FinDoc Analyzer

## Overview

This guide provides detailed instructions for configuring API keys for the FinDoc Analyzer application. Proper API key configuration is essential for the application to function correctly, particularly for document processing and AI functionality.

## Required API Keys

The FinDoc Analyzer application requires the following API keys:

1. **OpenAI API Key**
   - Used for: AI chat functionality, document understanding
   - Environment Variable: `OPENAI_API_KEY`

2. **Google Cloud API Key**
   - Used for: Document storage, OCR processing
   - Environment Variable: `GOOGLE_CLOUD_API_KEY`

3. **Supabase API Key**
   - Used for: Database access, user authentication
   - Environment Variables: `SUPABASE_URL`, `SUPABASE_KEY`

4. **Gemini API Key (Optional)**
   - Used for: Alternative AI model for document understanding
   - Environment Variable: `GEMINI_API_KEY`

## Configuration Methods

There are three ways to configure API keys for the FinDoc Analyzer application:

1. **Google Cloud Secret Manager (Recommended)**
2. **Environment Variables**
3. **Local Configuration File**

### Method 1: Google Cloud Secret Manager (Recommended)

This is the recommended method for production environments as it provides the highest level of security.

#### Step 1: Create Secrets in Google Cloud Secret Manager

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (`findoc-deploy`)
3. Navigate to **Security > Secret Manager**
4. Click **Create Secret**
5. Create the following secrets:
   - `openai-api-key`: Your OpenAI API key
   - `google-cloud-api-key`: Your Google Cloud API key
   - `supabase-key`: Your Supabase API key
   - `gemini-api-key`: Your Gemini API key (if available)

#### Step 2: Configure Access Permissions

1. For each secret, click on the secret name
2. Click on the **Permissions** tab
3. Add the following roles:
   - `Secret Manager Secret Accessor` to the App Engine service account (`findoc-deploy@appspot.gserviceaccount.com`)

#### Step 3: Update app.yaml

Add the following environment variables to your `app.yaml` file:

```yaml
env_variables:
  OPENAI_API_KEY: ${sm://projects/findoc-deploy/secrets/openai-api-key/versions/latest}
  GOOGLE_CLOUD_API_KEY: ${sm://projects/findoc-deploy/secrets/google-cloud-api-key/versions/latest}
  SUPABASE_URL: "https://dnjnsotemnfrjlotgved.supabase.co"
  SUPABASE_KEY: ${sm://projects/findoc-deploy/secrets/supabase-key/versions/latest}
  GEMINI_API_KEY: ${sm://projects/findoc-deploy/secrets/gemini-api-key/versions/latest}
```

### Method 2: Environment Variables

This method is suitable for development environments.

#### Step 1: Set Environment Variables

**Windows (PowerShell):**

```powershell
$env:OPENAI_API_KEY = "your-openai-api-key"
$env:GOOGLE_CLOUD_API_KEY = "your-google-cloud-api-key"
$env:SUPABASE_URL = "https://dnjnsotemnfrjlotgved.supabase.co"
$env:SUPABASE_KEY = "your-supabase-key"
$env:GEMINI_API_KEY = "your-gemini-api-key"
```

**Linux/macOS:**

```bash
export OPENAI_API_KEY="your-openai-api-key"
export GOOGLE_CLOUD_API_KEY="your-google-cloud-api-key"
export SUPABASE_URL="https://dnjnsotemnfrjlotgved.supabase.co"
export SUPABASE_KEY="your-supabase-key"
export GEMINI_API_KEY="your-gemini-api-key"
```

#### Step 2: Update app.yaml

Add the following environment variables to your `app.yaml` file:

```yaml
env_variables:
  OPENAI_API_KEY: ${OPENAI_API_KEY}
  GOOGLE_CLOUD_API_KEY: ${GOOGLE_CLOUD_API_KEY}
  SUPABASE_URL: ${SUPABASE_URL}
  SUPABASE_KEY: ${SUPABASE_KEY}
  GEMINI_API_KEY: ${GEMINI_API_KEY}
```

### Method 3: Local Configuration File

This method is suitable for local development environments.

#### Step 1: Create a Configuration File

Create a file named `.env` in the root directory of your project with the following content:

```
OPENAI_API_KEY=your-openai-api-key
GOOGLE_CLOUD_API_KEY=your-google-cloud-api-key
SUPABASE_URL=https://dnjnsotemnfrjlotgved.supabase.co
SUPABASE_KEY=your-supabase-key
GEMINI_API_KEY=your-gemini-api-key
```

#### Step 2: Load Environment Variables

Add the following code to your application's entry point (e.g., `server.js`):

```javascript
require('dotenv').config();
```

## API Key Validation

The FinDoc Analyzer application includes an API key validation system that checks if the configured API keys are valid. If any API key is invalid, a warning will be displayed to the user.

### Validation Endpoints

The application provides the following endpoints for API key validation:

- `/api/keys/validate`: Validates an API key
- `/api/keys/get`: Gets an API key from the server
- `/api/gcp/secrets/get`: Gets a secret from Google Cloud Secret Manager

### Validation Process

1. The application attempts to get API keys from Google Cloud Secret Manager
2. If that fails, it falls back to environment variables
3. If that fails, it uses default API keys (for development only)
4. The application validates each API key by making a test request to the corresponding API
5. If any API key is invalid, a warning is displayed to the user

## Troubleshooting

### API Key Validation Failures

If you see a warning about invalid API keys, check the following:

1. **Check API Key Values**: Verify that the API keys are correct and have not expired
2. **Check API Key Permissions**: Verify that the API keys have the necessary permissions
3. **Check Secret Manager Access**: Verify that the App Engine service account has access to the secrets
4. **Check Environment Variables**: Verify that the environment variables are set correctly

### Document Processing Failures

If document processing fails with an error about API keys, check the following:

1. **Check Google Cloud API Key**: Verify that the Google Cloud API key is valid and has the necessary permissions
2. **Check OCR API Access**: Verify that the Google Cloud API key has access to the Vision API
3. **Check Document Storage**: Verify that the application has access to Google Cloud Storage

### AI Chat Failures

If AI chat fails with an error about API keys, check the following:

1. **Check OpenAI API Key**: Verify that the OpenAI API key is valid and has the necessary permissions
2. **Check Gemini API Key**: If using Gemini, verify that the Gemini API key is valid
3. **Check API Usage Limits**: Verify that you have not exceeded your API usage limits

## Security Considerations

### API Key Security

API keys are sensitive information and should be treated as secrets. Never commit API keys to version control or share them publicly. Use the following best practices:

1. **Use Secret Manager**: Store API keys in Google Cloud Secret Manager
2. **Rotate API Keys Regularly**: Rotate API keys every 90 days
3. **Use Least Privilege**: Only grant the necessary permissions to API keys
4. **Monitor API Key Usage**: Monitor API key usage for unusual activity

### Environment Variable Security

Environment variables can be exposed in various ways. Use the following best practices:

1. **Don't Log Environment Variables**: Don't log environment variables or include them in error messages
2. **Don't Expose Environment Variables to Clients**: Don't expose environment variables to client-side code
3. **Use .env Files**: Use .env files for local development and add them to .gitignore

## Conclusion

Proper API key configuration is essential for the FinDoc Analyzer application to function correctly. By following this guide, you can ensure that your application has the necessary API keys and that they are configured securely.

For any questions or issues, please contact the development team.
