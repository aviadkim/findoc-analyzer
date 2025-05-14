/**
 * Run simple UI tests for FinDoc Analyzer
 * 
 * This script:
 * 1. Checks if the server is running
 * 2. Starts the server if needed
 * 3. Runs the simple UI tests
 * 4. Generates test reports with screenshots
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const config = {
  port: 8080,
  startTimeout: 5000, // 5 seconds
  serverStartRetries: 3,
  logDir: path.join(__dirname, 'logs'),
  serverLogFile: path.join(__dirname, 'logs', 'server-test.log')
};

// Ensure log directory exists
if (!fs.existsSync(config.logDir)) {
  fs.mkdirSync(config.logDir, { recursive: true });
}

/**
 * Check if server is running
 * @returns {Promise<boolean>} - True if server is running
 */
function isServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${config.port}/api/health`, (res) => {
      if (res.statusCode === 200) {
        // The server is running
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.status === 'ok') {
              resolve(true);
            } else {
              resolve(false);
            }
          } catch (e) {
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
    
    req.on('error', () => {
      // The server is not running
      resolve(false);
    });
    
    req.end();
  });
}

/**
 * Start the server
 * @returns {Promise<object>} - Server process
 */
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('Starting server...');
    
    // Create log file stream
    const logStream = fs.createWriteStream(config.serverLogFile, { flags: 'a' });
    
    // Start the server
    const server = spawn('node', ['server.js'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true
    });
    
    // Pipe server output to log file
    server.stdout.pipe(logStream);
    server.stderr.pipe(logStream);
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('Error starting server:', error);
      reject(error);
    });
    
    // Wait for server to start
    setTimeout(async () => {
      const running = await isServerRunning();
      if (running) {
        console.log('Server started successfully');
        resolve(server);
      } else {
        console.error('Server failed to start');
        server.kill();
        reject(new Error('Server failed to start'));
      }
    }, config.startTimeout);
  });
}

/**
 * Stop the server
 * @param {object} server - Server process
 */
function stopServer(server) {
  if (server && server.pid) {
    console.log('Stopping server...');
    
    try {
      process.kill(-server.pid);
      console.log('Server stopped');
    } catch (error) {
      console.error('Error stopping server:', error);
    }
  }
}

/**
 * Kill any existing server process at the specified port
 */
function killExistingServer() {
  return new Promise((resolve, reject) => {
    // Using different commands based on platform
    const command = process.platform === 'win32'
      ? `netstat -ano | findstr :${config.port}`
      : `lsof -i :${config.port} | grep LISTEN`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // No process found, that's fine
        return resolve();
      }
      
      try {
        // Extract PID based on platform
        let pid;
        if (process.platform === 'win32') {
          const match = stdout.match(/LISTENING\s+(\d+)/);
          if (match && match[1]) {
            pid = match[1];
          }
        } else {
          const match = stdout.match(/node\s+(\d+)/);
          if (match && match[1]) {
            pid = match[1];
          }
        }
        
        if (pid) {
          console.log(`Found existing server process (PID: ${pid}), killing...`);
          
          // Kill the process
          const killCommand = process.platform === 'win32'
            ? `taskkill /F /PID ${pid}`
            : `kill -9 ${pid}`;
          
          exec(killCommand, (killError) => {
            if (killError) {
              console.error('Error killing process:', killError);
              // Continue anyway
            }
            
            // Wait a bit for the port to be released
            setTimeout(resolve, 1000);
          });
        } else {
          // No process found
          resolve();
        }
      } catch (e) {
        console.error('Error parsing process info:', e);
        // Continue anyway
        resolve();
      }
    });
  });
}

/**
 * Run the simple UI tests
 */
function runSimpleUITests() {
  return new Promise((resolve, reject) => {
    console.log('\nRunning simple UI tests...');
    
    const testProcess = spawn('node', ['simple-ui-test.js'], {
      stdio: 'inherit'
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log('UI tests completed successfully');
        resolve();
      } else {
        console.error(`UI tests failed with code ${code}`);
        reject(new Error(`UI tests failed with code ${code}`));
      }
    });
    
    testProcess.on('error', (error) => {
      console.error('Error running UI tests:', error);
      reject(error);
    });
  });
}

/**
 * Main function
 */
async function main() {
  try {
    // First check if server is already running
    console.log('Checking if server is already running...');
    const serverRunning = await isServerRunning();
    
    let serverProcess = null;
    
    if (serverRunning) {
      console.log('Server is already running, using existing server');
    } else {
      // Kill any existing servers that might be stuck
      await killExistingServer();
      
      // Try to start the server
      for (let i = 0; i < config.serverStartRetries; i++) {
        try {
          serverProcess = await startServer();
          break;
        } catch (error) {
          console.error(`Attempt ${i + 1} failed:`, error.message);
          
          if (i === config.serverStartRetries - 1) {
            throw new Error('Failed to start server after multiple attempts');
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    // Run the UI tests
    await runSimpleUITests();
    
    // If we started the server, stop it
    if (serverProcess) {
      stopServer(serverProcess);
    }
    
    console.log('\n✅ All tests completed successfully!');
    
    // On Windows, the process sometimes doesn't exit properly
    if (process.platform === 'win32') {
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();