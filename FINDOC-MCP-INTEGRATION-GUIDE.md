# FinDoc Analyzer MCP Integration Guide

This guide explains how the FinDoc Analyzer integrates with Model Context Protocol (MCP) to enhance document processing capabilities and provide a more robust SaaS solution.

## Overview

The FinDoc Analyzer now supports enhanced document processing capabilities through MCP integration. This integration provides:

1. Improved text extraction from financial documents
2. Enhanced entity recognition and extraction (ISINs, companies, securities)
3. Enriched financial data through Brave Search and other MCPs
4. Graceful fallback to standard processing when MCPs are unavailable
5. Tenant-isolated API key management

## Architecture

The MCP integration follows a layered architecture:

```
┌─────────────────────────┐
│ Document Processor API  │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐    ┌─────────────────────┐
│ MCP Document Processor  │◄───┤ API Key Management  │
└───────────┬─────────────┘    └─────────────────────┘
            │
┌───────────▼─────────────┐
│ Sequential Thinking MCP │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│ Brave Search MCP        │
└─────────────────────────┘
```

## Key MCP Components

The FinDoc Analyzer integrates the following MCP components:

### 1. MCP Document Processor

The core component for enhanced document processing:

```javascript
// services/mcp-document-processor.js - Key implementation
async function processDocument(filePath, options = {}) {
  // Extract text with MCP
  const text = await extractTextWithMcp(filePath);

  // Extract entities (ISINs, companies, etc.)
  const entities = await extractEntitiesWithMcp(text);

  // Enrich entities with additional data
  const enrichedEntities = await enrichEntitiesWithMcp(entities);

  return {
    fileName: path.basename(filePath),
    text,
    entities: enrichedEntities
  };
}
```

### 2. Sequential Thinking MCP

Used for advanced text extraction and entity recognition:

```javascript
// Sequential Thinking MCP integration
async function extractEntitiesWithMcp(text) {
  try {
    console.log('Using Sequential Thinking MCP for entity extraction');

    return new Promise((resolve, reject) => {
      // Spawn Sequential Thinking MCP
      const mcpProcess = spawn('npx', ['@modelcontextprotocol/server-sequential-thinking']);

      const payload = {
        action: 'think',
        params: {
          question: `Extract all financial entities (companies, ISINs, metrics) from this text: ${text}`,
          maxSteps: 3
        }
      };

      // Process the response...

      // Send payload to MCP
      mcpProcess.stdin.write(JSON.stringify(payload));
      mcpProcess.stdin.end();
    });
  } catch (error) {
    // Fallback to regex extraction
    return extractEntitiesWithRegex(text);
  }
}
```

### 3. Brave Search MCP

Used for enriching financial entity data:

```javascript
// Brave Search MCP integration for enriching entities
async function enrichCompanyWithSearch(entity) {
  return new Promise((resolve, reject) => {
    // Spawn Brave Search MCP
    const mcpProcess = spawn('npx', ['brave-search-mcp'], {
      env: { ...process.env }
    });

    const payload = {
      action: 'search',
      params: {
        q: `${entity.name} ${entity.isin || ''} stock ticker financial information`,
        type: 'web',
        count: 2
      }
    };

    // Process the search results...

    // Send payload to MCP
    mcpProcess.stdin.write(JSON.stringify(payload));
    mcpProcess.stdin.end();
  });
}
```

## Integration with Main Document Processor

The main document processor (`services/document-processor.js`) integrates with the MCP document processor through a feature flag approach. This allows for gradual adoption and graceful fallback:

```javascript
// Process document based on file type and MCP preference
if (options.useMcp) {
  try {
    // Import the MCP document processor
    const mcpDocumentProcessor = require('./mcp-document-processor');

    // Process with MCP
    const mcpResult = await mcpDocumentProcessor.processDocument(filePath, options);

    // Use the MCP results
    processedDocument = {
      metadata: {
        ...processedDocument.metadata,
        processingMethod: 'mcp',
      },
      text: mcpResult.text || '',
      tables: mcpResult.tables || [],
      entities: mcpResult.entities || [],
      securities: mcpResult.entities?.filter(e => e.type === 'security' || e.isin) || []
    };
  } catch (mcpError) {
    // Fall back to standard processing
    console.warn('MCP processing failed, falling back to standard processing:', mcpError.message);
    // ... standard processing follows ...
  }
}
```

## API Key Management Integration

The MCP integration uses our secure API Key Provider service for managing and isolating API keys:

```javascript
// Retrieve API key with proper tenant isolation
const geminiApiKey = await apiKeyProvider.getApiKey('gemini', {
  tenantId: options.tenantId
});

// Use the API key with MCP
const mcpResult = await mcpProcess.invoke({
  action: 'process',
  params: {
    text,
    apiKey: geminiApiKey
  }
});
```

## Installing Required MCPs

To enable MCP capabilities in FinDoc Analyzer, install the following packages:

```bash
# Install core MCP packages
npm install @modelcontextprotocol/server-sequential-thinking brave-search-mcp

# Install specialized financial MCPs
npm install mcp-financial-entity-extractor mcp-table-detector mcp-ner

# Install development MCPs
npm install mcp-puppeteer mcp-github
```

## Setup and Configuration

The setup process is streamlined with our setup script:

```bash
# Run the MCP setup script
./setup-mcp-environment.sh

# Configure the environment
cp .env.example .env
nano .env  # Add your API keys

# Start the essential MCPs
./start-essential-mcps.sh

# Test the MCP integration
node test-mcp-document-processor.js
```

## Security and Multi-tenancy

Our MCP integration ensures proper security and multi-tenancy:

1. **API Keys**: All API keys are securely stored in Google Secret Manager
2. **Tenant Isolation**: API keys are isolated per tenant
3. **Fallback Mechanisms**: System gracefully degrades if MCPs are unavailable
4. **Error Handling**: Comprehensive error handling prevents cascading failures

## Fallback Strategy

The FinDoc Analyzer implements a robust fallback strategy:

```javascript
// Example of our multi-level fallback approach
async function extractEntitiesWithMcp(text, options) {
  try {
    // Try financial entity extraction MCP
    const financialMcp = require('mcp-financial-entity-extractor');
    const extractedEntities = await financialMcp.extractEntities(text, options);
    return extractedEntities;
  } catch (financialError) {
    try {
      // Try NER (named entity recognition) MCP
      const nerMcp = require('mcp-ner');
      const entities = await nerMcp.recognizeEntities(text);
      return entities;
    } catch (nerError) {
      // Fall back to basic regex pattern extraction
      return extractEntitiesBasic(text);
    }
  }
}
```

## Testing MCP Integration

We provide a comprehensive testing script to verify MCP integration:

```bash
# Run the MCP integration test
node test-mcp-document-processor.js
```

This test script:
1. Tests direct MCP document processing
2. Tests the main document processor with MCPs enabled
3. Tests fallback to standard processing
4. Generates a comparison report

## Troubleshooting

Common issues and solutions:

1. **MCP Not Found**: Ensure MCPs are properly installed with `npm list`
2. **API Key Issues**: Verify API keys are properly stored in Google Secret Manager
3. **Fallback Not Working**: Check the error logs to identify which specific MCP component is failing

## Future Enhancements

Planned enhancements for our MCP integration:

1. **Enhanced Entity Recognition**: Implement more specialized financial entity recognition MCPs
2. **Multi-document Analysis**: Add support for comparing multiple documents with MCPs
3. **Caching**: Implement result caching to improve performance
4. **Custom MCP Configurations**: Allow tenants to configure their preferred MCPs

## Conclusion

The MCP integration provides significant advantages for the FinDoc Analyzer SaaS solution:

1. **Enhanced Capabilities**: Better financial entity extraction and enrichment
2. **Secure API Key Management**: Proper isolation and secure storage
3. **Robustness**: Graceful fallback mechanisms ensure service reliability
4. **Scalability**: Architecture designed for future MCP enhancements