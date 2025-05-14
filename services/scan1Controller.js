/**
 * scan1Controller.js
 * 
 * This file provides a simplified version of the scan1Controller for the FinDoc Analyzer application.
 * It includes functions for processing documents, checking scan1 availability, and verifying the Gemini API key.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Check if Scan1 is available
 * @returns {Promise<boolean>} Whether Scan1 is available
 */
const isScan1Available = async () => {
  try {
    console.log('Checking if Scan1 is available...');
    
    // Check if Python is available
    let pythonAvailable = false;
    let python3Available = false;
    let pythonCommand = 'python';
    let pythonVersion = 'Unknown';
    let python3Version = 'Unknown';

    // Try python command
    try {
      console.log('Trying python command...');
      const pythonProcess = spawn('python', ['--version']);

      // Capture stdout and stderr
      pythonProcess.stdout.on('data', (data) => {
        pythonVersion = data.toString().trim();
        console.log(`Python version (stdout): ${pythonVersion}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        // Some Python versions output version to stderr
        if (!pythonVersion || pythonVersion === 'Unknown') {
          pythonVersion = data.toString().trim();
          console.log(`Python version (stderr): ${pythonVersion}`);
        }
      });

      pythonAvailable = await new Promise((resolve) => {
        pythonProcess.on('close', (code) => {
          if (code === 0) {
            console.log('Python is available');
            resolve(true);
          } else {
            console.warn(`Python command not available (exit code: ${code})`);
            resolve(false);
          }
        });

        // Handle process error
        pythonProcess.on('error', (error) => {
          console.warn('Error checking Python availability:', error);
          resolve(false);
        });
      });
      
      console.log(`Python available: ${pythonAvailable}, Version: ${pythonVersion}`);
    } catch (error) {
      console.warn('Error checking Python availability:', error);
    }

    // If python command failed, try python3 command
    if (!pythonAvailable) {
      try {
        console.log('Trying python3 command...');
        const python3Process = spawn('python3', ['--version']);

        // Capture stdout and stderr
        python3Process.stdout.on('data', (data) => {
          python3Version = data.toString().trim();
          console.log(`Python3 version (stdout): ${python3Version}`);
        });

        python3Process.stderr.on('data', (data) => {
          // Some Python versions output version to stderr
          if (!python3Version || python3Version === 'Unknown') {
            python3Version = data.toString().trim();
            console.log(`Python3 version (stderr): ${python3Version}`);
          }
        });

        python3Available = await new Promise((resolve) => {
          python3Process.on('close', (code) => {
            if (code === 0) {
              console.log('Python3 is available');
              pythonCommand = 'python3';
              resolve(true);
            } else {
              console.warn(`Python3 command not available (exit code: ${code})`);
              resolve(false);
            }
          });

          // Handle process error
          python3Process.on('error', (error) => {
            console.warn('Error checking Python3 availability:', error);
            resolve(false);
          });
        });
        
        console.log(`Python3 available: ${python3Available}, Version: ${python3Version}`);
      } catch (error) {
        console.warn('Error checking Python3 availability:', error);
      }
    }

    // If neither python nor python3 is available, return false
    if (!pythonAvailable && !python3Available) {
      console.warn('Neither Python nor Python3 is available');
      return false;
    }

    // Check for required packages
    // Adjust required packages to match what's actually needed
    // PyMuPDF is imported as 'fitz' in Python
    const requiredPackages = ['PyMuPDF', 'pandas'];
    let packagesAvailable = true;
    let missingPackagesList = [];

    try {
      console.log(`Checking for required packages: ${requiredPackages.join(', ')}`);
      
      // Create a temporary script to check for packages
      const tempDir = process.env.TEMP_FOLDER
        ? path.join(process.env.TEMP_FOLDER, 'scan1-check')
        : path.join(process.cwd(), 'temp', 'scan1-check');

      console.log(`Creating temporary directory: ${tempDir}`);
      fs.mkdirSync(tempDir, { recursive: true });
      const scriptPath = path.join(tempDir, 'check_packages.py');

      // Improved package checking script
      const checkScript = `
import sys
import importlib.util
import json

# Map package import names to package names
package_map = {
    'PyMuPDF': 'fitz',  # PyMuPDF is imported as 'fitz'
    'pandas': 'pandas'
}

required_packages = ${JSON.stringify(requiredPackages)}
missing_packages = []
available_packages = []

for package in required_packages:
    import_name = package_map.get(package, package)
    try:
        # Try to import the package
        spec = importlib.util.find_spec(import_name)
        if spec is None:
            missing_packages.append(package)
            print(f"Package {package} (import name: {import_name}) not found", file=sys.stderr)
        else:
            available_packages.append(package)
            print(f"Package {package} (import name: {import_name}) is available", file=sys.stderr)
    except ImportError as e:
        missing_packages.append(package)
        print(f"Error importing {package} (import name: {import_name}): {str(e)}", file=sys.stderr)

# Print results as JSON
result = {
    "missing": missing_packages,
    "available": available_packages
}
print(json.dumps(result))
`;

      console.log('Writing package check script...');
      fs.writeFileSync(scriptPath, checkScript);

      console.log(`Running package check with ${pythonCommand}...`);
      const packageProcess = spawn(pythonCommand, [scriptPath]);

      let packageOutput = '';
      let packageError = '';

      packageProcess.stdout.on('data', (data) => {
        packageOutput += data.toString();
      });

      packageProcess.stderr.on('data', (data) => {
        packageError += data.toString();
        // Log stderr output for debugging
        console.log(`Package check stderr: ${data.toString().trim()}`);
      });

      await new Promise((resolve) => {
        packageProcess.on('close', (code) => {
          console.log(`Package check process exited with code ${code}`);
          console.log(`Package check stdout: ${packageOutput.trim()}`);
          
          try {
            if (packageOutput.trim()) {
              const result = JSON.parse(packageOutput.trim());
              missingPackagesList = result.missing || [];
              
              if (missingPackagesList.length > 0) {
                console.warn('Missing Python packages:', missingPackagesList);
                packagesAvailable = false;
              } else {
                console.log('All required packages are available');
                packagesAvailable = true;
              }
            } else {
              console.warn('No output from package check script');
              packagesAvailable = false;
            }
          } catch (error) {
            console.warn('Error parsing package check output:', error);
            packagesAvailable = false;
          }
          resolve();
        });

        // Handle process error
        packageProcess.on('error', (error) => {
          console.warn('Error checking Python packages:', error);
          packagesAvailable = false;
          resolve();
        });
      });

      // Clean up
      try {
        console.log('Cleaning up temporary files...');
        fs.unlinkSync(scriptPath);
        fs.rmdirSync(tempDir);
      } catch (cleanupError) {
        console.warn('Error cleaning up temporary files:', cleanupError);
      }
    } catch (error) {
      console.warn('Error checking Python packages:', error);
      packagesAvailable = false;
    }

    // Return true if Python and required packages are available
    const scan1Available = (pythonAvailable || python3Available) && packagesAvailable;
    console.log(`Scan1 available: ${scan1Available} (Python: ${pythonAvailable}, Python3: ${python3Available}, Packages: ${packagesAvailable})`);
    
    if (!scan1Available) {
      console.log('Scan1 is not available. Details:');
      console.log(`- Python available: ${pythonAvailable} (${pythonVersion})`);
      console.log(`- Python3 available: ${python3Available} (${python3Version})`);
      console.log(`- Required packages available: ${packagesAvailable}`);
      if (!packagesAvailable) {
        console.log(`- Missing packages: ${missingPackagesList.join(', ')}`);
      }
    }
    
    return scan1Available;
  } catch (error) {
    console.warn('Error checking Scan1 availability:', error);
    return false;
  }
};

/**
 * Process a document with Scan1
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const processDocumentWithScan1 = async (req, res) => {
  try {
    console.log('Processing document with Scan1...');
    
    // Check if Scan1 is available
    const scan1Available = await isScan1Available();
    
    if (!scan1Available) {
      return res.status(400).json({
        success: false,
        error: 'Scan1 is not available',
        message: 'Please make sure Python and required packages are installed'
      });
    }
    
    // Mock document processing
    const documentId = req.params.id;
    
    // Return mock data
    res.status(200).json({
      success: true,
      message: 'Document processed successfully',
      data: {
        id: documentId,
        metadata: {
          document_type: 'financial_report',
          securities: [
            {
              name: 'Apple Inc.',
              isin: 'US0378331005',
              quantity: 1000,
              price: 150.00,
              value: 175000.00,
              weight: 7.0
            },
            {
              name: 'Microsoft',
              isin: 'US5949181045',
              quantity: 800,
              price: 250.00,
              value: 240000.00,
              weight: 9.6
            }
          ],
          portfolio_summary: {
            total_value: 2500000,
            currency: 'USD',
            valuation_date: '2023-12-31'
          },
          asset_allocation: {
            'Stocks': {
              percentage: 60
            },
            'Bonds': {
              percentage: 30
            },
            'Cash': {
              percentage: 10
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error processing document with Scan1:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing document',
      message: error.message
    });
  }
};

/**
 * Get scan1 status
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const getScan1Status = async (req, res) => {
  try {
    console.log('getScan1Status called');
    
    // Check if scan1 is available
    const scan1Available = await isScan1Available();
    
    // Get Python version
    let pythonVersion = 'Unknown';
    let python3Version = 'Unknown';
    
    try {
      const pythonProcess = spawn('python', ['--version']);
      
      pythonProcess.stdout.on('data', (data) => {
        pythonVersion = data.toString().trim();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        // Python version is output to stderr in older versions
        if (!pythonVersion || pythonVersion === 'Unknown') {
          pythonVersion = data.toString().trim();
        }
      });
      
      await new Promise((resolve) => {
        pythonProcess.on('close', () => {
          resolve();
        });
      });
    } catch (error) {
      console.warn('Error getting Python version:', error);
    }
    
    try {
      const python3Process = spawn('python3', ['--version']);
      
      python3Process.stdout.on('data', (data) => {
        python3Version = data.toString().trim();
      });
      
      python3Process.stderr.on('data', (data) => {
        // Python version is output to stderr in older versions
        if (!python3Version || python3Version === 'Unknown') {
          python3Version = data.toString().trim();
        }
      });
      
      await new Promise((resolve) => {
        python3Process.on('close', () => {
          resolve();
        });
      });
    } catch (error) {
      console.warn('Error getting Python3 version:', error);
    }
    
    // Return status
    res.status(200).json({
      success: true,
      scan1Available,
      pythonVersion,
      python3Version,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    });
  } catch (error) {
    console.error('Error getting scan1 status:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting scan1 status',
      message: error.message
    });
  }
};

/**
 * Verify Gemini API key
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const verifyGeminiApiKey = async (req, res) => {
  try {
    console.log('verifyGeminiApiKey called');
    
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }
    
    // Mock API key verification
    if (apiKey.startsWith('GEMINI_') || apiKey.length > 20) {
      return res.status(200).json({
        success: true,
        message: 'API key is valid'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'API key is invalid'
      });
    }
  } catch (error) {
    console.error('Error verifying Gemini API key:', error);
    res.status(500).json({
      success: false,
      error: 'Error verifying Gemini API key',
      message: error.message
    });
  }
};

module.exports = {
  processDocumentWithScan1,
  isScan1Available,
  getScan1Status,
  verifyGeminiApiKey
};
