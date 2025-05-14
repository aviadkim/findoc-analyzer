# MCP Servers Setup

This document explains how to set up and use the Model Context Protocol (MCP) servers for your application.

## Installed MCP Servers

1. **Firecrawl MCP** - Web scraping and browser automation
   - Port: 8081
   - API Key: `fc-857417811665460e92716b92e08ec398`

2. **Context7 MCP** - Context storage and retrieval
   - Port: 8082

## Starting MCP Servers

### Windows

Run the batch file:
```
start-mcps.bat
```

### macOS/Linux

Run the shell script:
```
chmod +x start-mcps.sh
./start-mcps.sh
```

## Stopping MCP Servers

### Windows

Run the batch file:
```
stop-mcps.bat
```

### macOS/Linux

Run the shell script:
```
chmod +x stop-mcps.sh
./stop-mcps.sh
```

## Testing the MCP Servers

### Firecrawl MCP

```javascript
// Example usage in JavaScript
const response = await fetch('http://localhost:8081/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com',
    options: {
      selectors: ['h1', 'p'],
      wait: 2000
    }
  })
});

const data = await response.json();
console.log(data);
```

### Context7 MCP

```javascript
// Example usage in JavaScript
const response = await fetch('http://localhost:8082/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'get',
    key: 'some-key'
  })
});

const data = await response.json();
console.log(data);
```

## Configuring MCP Servers

The MCP servers are configured using JSON files:

- `firecrawl-config.json` - Configuration for Firecrawl MCP
- `context7-config.json` - Configuration for Context7 MCP

Feel free to modify these files to adjust the behavior of the MCP servers.

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port in the configuration file and restart the server.

2. **Node.js version incompatibility**
   - Ensure you're using Node.js v18.0.0 or later.

3. **Puppeteer issues**
   - Puppeteer might need additional dependencies installed on your system.

### Logs

Check the console output of the MCP servers for error messages and troubleshooting information.

## Additional Resources

- [Firecrawl Documentation](https://github.com/mendableai/firecrawl-mcp-server)
- [Context7 Documentation](https://github.com/upstash/context7)
- [MCP Core Documentation](https://github.com/modelcontextprotocol/servers)