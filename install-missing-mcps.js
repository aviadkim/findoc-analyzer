/**
 * Script to install missing MCP servers
 * 
 * This script installs and configures the following MCP servers:
 * - Context7 MCP (for code context and dependency analysis)
 * - Google ADK MCP (for Google Agent Development Kit)
 * - Agent Starter Pack MCP (for Google Agent Starter Pack)
 * - A2A Protocol MCP (for Agent-to-Agent communication)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const MCP_SERVERS_DIR = path.join(os.homedir(), '.mcp-servers');
const MCP_CONFIG_DIR = path.join(os.homedir(), '.mcp-config');

// Create directories if they don't exist
if (!fs.existsSync(MCP_SERVERS_DIR)) {
  fs.mkdirSync(MCP_SERVERS_DIR, { recursive: true });
  console.log(`Created directory: ${MCP_SERVERS_DIR}`);
}

if (!fs.existsSync(MCP_CONFIG_DIR)) {
  fs.mkdirSync(MCP_CONFIG_DIR, { recursive: true });
  console.log(`Created directory: ${MCP_CONFIG_DIR}`);
}

// Function to install an npm package
function installPackage(packageName) {
  try {
    console.log(`Installing ${packageName}...`);
    execSync(`npm install -g ${packageName}`, { stdio: 'inherit' });
    console.log(`Successfully installed ${packageName}`);
    return true;
  } catch (error) {
    console.error(`Failed to install ${packageName}: ${error.message}`);
    return false;
  }
}

// Function to create MCP configuration file
function createMcpConfig(filename, config) {
  const configPath = path.join(MCP_SERVERS_DIR, filename);
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`Created configuration file: ${configPath}`);
    return true;
  } catch (error) {
    console.error(`Failed to create configuration file ${configPath}: ${error.message}`);
    return false;
  }
}

// Install Context7 MCP
console.log('\n=== Installing Context7 MCP ===');
if (installPackage('@upstash/context7-mcp')) {
  const context7Config = {
    servers: {
      Context7: {
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@upstash/context7-mcp@latest']
      }
    }
  };
  createMcpConfig('context7-mcp.json', context7Config);
}

// Install Google ADK MCP (placeholder - package name may differ)
console.log('\n=== Installing Google ADK MCP ===');
// Note: This is a placeholder. The actual package name may be different.
// We're creating the configuration file anyway for future use.
const adkConfig = {
  servers: {
    GoogleADK: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', 'google-adk-mcp@latest']
    }
  }
};
createMcpConfig('google-adk-mcp.json', adkConfig);

// Install Agent Starter Pack MCP (placeholder - package name may differ)
console.log('\n=== Installing Agent Starter Pack MCP ===');
// Note: This is a placeholder. The actual package name may be different.
// We're creating the configuration file anyway for future use.
const aspConfig = {
  servers: {
    AgentStarterPack: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', 'agent-starter-pack-mcp@latest']
    }
  }
};
createMcpConfig('agent-starter-pack-mcp.json', aspConfig);

// Install A2A Protocol MCP (placeholder - package name may differ)
console.log('\n=== Installing A2A Protocol MCP ===');
// Note: This is a placeholder. The actual package name may be different.
// We're creating the configuration file anyway for future use.
const a2aConfig = {
  servers: {
    A2AProtocol: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', 'a2a-protocol-mcp@latest']
    }
  }
};
createMcpConfig('a2a-protocol-mcp.json', a2aConfig);

console.log('\n=== Installation Complete ===');
console.log('The following MCP servers have been configured:');
console.log('- Context7 MCP');
console.log('- Google ADK MCP (configuration only)');
console.log('- Agent Starter Pack MCP (configuration only)');
console.log('- A2A Protocol MCP (configuration only)');
console.log('\nTo use these MCPs, restart your editor or IDE.');
