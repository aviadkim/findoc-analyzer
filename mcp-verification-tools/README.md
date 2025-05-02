# Global MCP Setup and Verification

This guide provides instructions for verifying and configuring your global MCP setup for use with Augment.

## Scripts Included

1. **verify-global-mcps.bat** - Verifies that your global MCPs are installed correctly
2. **configure-augment-mcps.bat** - Configures Augment to use your global MCPs
3. **test-augment-mcps.bat** - Creates a test project to verify MCPs work with Augment
4. **start-selected-mcps.bat** - Selectively starts MCPs based on your needs

## Step 1: Verify Global MCPs

Run `verify-global-mcps.bat` to check if your global MCPs are installed correctly:

```
verify-global-mcps.bat
```

This script will:
- Check if MCP files exist in the correct locations
- Verify that Augment's configuration is pointing to these MCPs
- Test a few key MCPs to ensure they're working

## Step 2: Configure Augment

If the verification shows that Augment is not configured correctly, run `configure-augment-mcps.bat`:

```
configure-augment-mcps.bat
```

This script will:
- Find your Augment settings file
- Create a backup of your current settings
- Generate a new configuration that points to your global MCPs
- Update your Augment settings file

## Step 3: Test with Augment

To test if the MCPs are working with Augment, run `test-augment-mcps.bat`:

```
test-augment-mcps.bat
```

This script will:
- Create a test project directory
- Create test files for various MCPs
- Provide instructions for testing each MCP with Augment

## Step 4: Start MCPs as Needed

To start MCPs selectively based on your needs, run `start-selected-mcps.bat`:

```
start-selected-mcps.bat
```

This script will:
- Show a menu of MCP categories
- Allow you to start MCPs by category
- Start the selected MCPs in separate windows
- Save logs to a temporary directory

## Global MCP Directory Structure

Your global MCPs are installed in:

```
C:\Users\aviad\.mcp-servers\
├── js\     # JavaScript MCPs
├── py\     # Python MCPs
└── ts\     # TypeScript MCPs
```

## Troubleshooting

If you encounter issues:

1. **MCPs not found**: Make sure the MCPs are installed in the correct location
2. **Augment settings not found**: Locate your Augment settings file and update the scripts
3. **MCPs not starting**: Check the logs in the temporary directory
4. **Augment not using MCPs**: Restart Augment after configuring

## Next Steps

After verifying your global MCP setup, you can:

1. Start implementing project-specific MCPs
2. Create a financial SaaS project with specialized MCPs
3. Configure client access to your MCPs

For more information, refer to the comprehensive MCP guide for financial SaaS development.
