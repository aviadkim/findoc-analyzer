/**
 * Install Python dependencies for scan1Controller
 * This script installs the required Python packages for the scan1Controller
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Required Python packages
const requiredPackages = [
  'PyMuPDF',
  'pandas',
  'numpy',
  'openpyxl',
  'python-dateutil'
];

// Check if Python is available
async function checkPython() {
  console.log('Checking if Python is available...');
  
  // Try python command
  try {
    const pythonProcess = spawn('python', ['--version']);
    
    let pythonOutput = '';
    let pythonError = '';
    
    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      pythonError += data.toString();
    });
    
    const exitCode = await new Promise((resolve) => {
      pythonProcess.on('close', (code) => {
        resolve(code);
      });
    });
    
    if (exitCode === 0) {
      console.log(`Python is available: ${pythonOutput.trim() || pythonError.trim()}`);
      return 'python';
    }
  } catch (error) {
    console.warn('Error checking Python availability:', error);
  }
  
  // Try python3 command
  try {
    const python3Process = spawn('python3', ['--version']);
    
    let python3Output = '';
    let python3Error = '';
    
    python3Process.stdout.on('data', (data) => {
      python3Output += data.toString();
    });
    
    python3Process.stderr.on('data', (data) => {
      python3Error += data.toString();
    });
    
    const exitCode = await new Promise((resolve) => {
      python3Process.on('close', (code) => {
        resolve(code);
      });
    });
    
    if (exitCode === 0) {
      console.log(`Python3 is available: ${python3Output.trim() || python3Error.trim()}`);
      return 'python3';
    }
  } catch (error) {
    console.warn('Error checking Python3 availability:', error);
  }
  
  console.error('Neither Python nor Python3 is available');
  return null;
}

// Install Python packages
async function installPackages(pythonCommand) {
  console.log(`Installing Python packages using ${pythonCommand}...`);
  
  // Create requirements.txt file
  const requirementsPath = path.join(__dirname, 'requirements.txt');
  fs.writeFileSync(requirementsPath, requiredPackages.join('\n'));
  
  console.log(`Created requirements.txt with packages: ${requiredPackages.join(', ')}`);
  
  // Install packages
  const pipCommand = pythonCommand === 'python3' ? 'pip3' : 'pip';
  
  try {
    const pipProcess = spawn(pipCommand, ['install', '-r', requirementsPath]);
    
    pipProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    pipProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    const exitCode = await new Promise((resolve) => {
      pipProcess.on('close', (code) => {
        resolve(code);
      });
    });
    
    if (exitCode === 0) {
      console.log('Python packages installed successfully');
      return true;
    } else {
      console.error(`Failed to install Python packages (exit code: ${exitCode})`);
      return false;
    }
  } catch (error) {
    console.error('Error installing Python packages:', error);
    return false;
  } finally {
    // Clean up
    try {
      fs.unlinkSync(requirementsPath);
    } catch (error) {
      console.warn('Error cleaning up requirements.txt:', error);
    }
  }
}

// Main function
async function main() {
  try {
    // Check if Python is available
    const pythonCommand = await checkPython();
    
    if (!pythonCommand) {
      console.error('Python is not available. Please install Python and try again.');
      process.exit(1);
    }
    
    // Install Python packages
    const packagesInstalled = await installPackages(pythonCommand);
    
    if (!packagesInstalled) {
      console.error('Failed to install Python packages. Please install them manually:');
      console.error(`${pythonCommand === 'python3' ? 'pip3' : 'pip'} install ${requiredPackages.join(' ')}`);
      process.exit(1);
    }
    
    console.log('All Python dependencies installed successfully');
  } catch (error) {
    console.error('Error installing Python dependencies:', error);
    process.exit(1);
  }
}

// Run main function
main();
