const { exec } = require('child_process');
const path = require('path');

// Configuration
const config = {
  baseDir: __dirname,
  testScript: path.join(__dirname, 'run-tests.js'),
  fixerScript: path.join(__dirname, 'fix-issues.js')
};

// Helper for running commands
function runCommand(command, description) {
  console.log(`\n==== ${description} ====\n`);
  
  return new Promise((resolve, reject) => {
    const process = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(error);
        return;
      }
      
      resolve();
    });
    
    process.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });
    
    process.stderr.on('data', (data) => {
      console.error(data.toString().trim());
    });
  });
}

// Main function
async function runTestsAndFix() {
  try {
    // Step 1: Run tests
    await runCommand(`node "${config.testScript}"`, "Running Initial Tests");
    
    // Step 2: Fix issues
    await runCommand(`node "${config.fixerScript}"`, "Fixing Issues");
    
    // Step 3: Run tests again to verify fixes
    await runCommand(`node "${config.testScript}"`, "Running Tests After Fixes");
    
    console.log('\n==== All Steps Completed ====\n');
    console.log('Check the test reports and screenshots for details.');
  } catch (error) {
    console.error('Failed to complete the process:', error);
  }
}

// Run the tests and fix process
runTestsAndFix().catch(console.error);
