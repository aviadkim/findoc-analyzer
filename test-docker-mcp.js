// Test Docker MCP
console.log('Testing Docker MCP...');

// Import Docker MCP client (this is a placeholder, actual import may differ)
// const docker = require('@modelcontextprotocol/client-docker');
// const dockerClient = new docker.DockerClient();

// Instead, we'll use the Docker CLI directly
const { exec } = require('child_process');

// Test Docker by listing containers
exec('docker ps', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`Docker containers:\n${stdout}`);
});

// Test Docker by listing images
exec('docker images', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`Docker images:\n${stdout}`);
});

console.log('Docker MCP test complete.');
