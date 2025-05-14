# FinDoc Analyzer MCP Setup Guide

This guide will help you set up and use Model Context Protocol (MCP) servers with the FinDoc Analyzer project.

## What are MCPs?

MCPs (Model Context Protocol servers) extend AI capabilities with specialized functions. For FinDoc Analyzer, we use MCPs for web search, document processing, testing, and more.

## Getting Started

1. **Set up environment variables**:
   
   Edit the `.env` file to add your API keys:
   
   ```
   # Get a Brave Search API key from https://brave.com/search/api/
   BRAVE_API_KEY=your_brave_api_key_here
   
   # Add other API keys as needed
   ```

2. **Start the MCPs**:
   
   ```bash
   ./start-essential-mcps.sh
   ```
   
   This will start the required MCP servers in the background.

3. **Verify MCP functionality**:
   
   ```bash
   node test-mcps-simple.js
   ```
   
   This will test if the MCPs are working correctly.

4. **Stop the MCPs**:
   
   ```bash
   ./stop-mcps.sh
   ```

## Available MCPs

The FinDoc Analyzer project uses the following MCPs:

1. **Brave Search MCP** - For web search and research capabilities
2. **Sequential Thinking MCP** - For advanced reasoning and problem-solving
3. **Playwright MCP** - For browser automation and testing

## Troubleshooting

If you encounter issues:

- Check the log files in the `mcp-logs` directory
- Verify your API keys in the `.env` file
- Make sure npm packages are installed with `npm install`
- Try restarting the MCPs with `./stop-mcps.sh` followed by `./start-essential-mcps.sh`

## Next Steps

See the `mcp-recommended-packages.md` file for additional MCPs that can enhance the FinDoc Analyzer project.
