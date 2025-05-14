/**
 * Enhanced Security Extractor Wrapper
 * 
 * This module wraps the Python SecurityExtractor class and provides a JavaScript-friendly interface.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const logger = require('../utils/logger');

// Default reference database
const DEFAULT_REF_DB = {
  get_name_by_isin: (isin) => null,
  normalize_security_name: (name) => name,
  validate_isin: (isin) => {
    // Basic ISIN validation
    const regex = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;
    return regex.test(isin);
  },
  find_best_match_for_name: (name, limit = 1) => {
    return [];
  },
  detect_security_type: (description) => null
};

class SecurityExtractor {
  /**
   * Create a SecurityExtractor instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.debug - Whether to print debug information
   */
  constructor(options = {}) {
    this.debug = options.debug || false;
    this.securities_db = DEFAULT_REF_DB;
    
    // Path to the Python CLI script
    this.scriptPath = path.resolve(__dirname, './extract_securities_cli.py');
    
    // Path to the original extractor
    this.extractorPath = path.resolve(__dirname, '../../../enhanced_securities_extractor.py');
    
    // Determine which script to use
    if (fs.existsSync(this.scriptPath)) {
      if (this.debug) {
        logger.info(`Using CLI wrapper at ${this.scriptPath}`);
      }
    } else if (fs.existsSync(this.extractorPath)) {
      this.scriptPath = this.extractorPath;
      if (this.debug) {
        logger.info(`Using extractor directly at ${this.extractorPath}`);
      }
    } else {
      logger.warn('SecurityExtractor script not found. Extraction will likely fail.');
    }
    
    // Create log directory
    this.logDir = path.resolve(__dirname, '../logs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Extract securities information from a PDF file
   * @param {string} pdfPath - Path to the PDF file
   * @returns {Promise<Object>} - Extracted securities information
   */
  async extract_from_pdf(pdfPath) {
    return new Promise((resolve, reject) => {
      if (!pdfPath || !fs.existsSync(pdfPath)) {
        return reject(new Error(`PDF file not found: ${pdfPath}`));
      }

      // Create a temporary file for the output
      const tempOutput = path.join(os.tmpdir(), `securities-${Date.now()}.json`);
      
      // Create a log file
      const logFile = path.join(this.logDir, `securities-${Date.now()}.log`);
      
      // Prepare command line arguments
      let args = [];
      
      // Check if we're using the CLI wrapper or direct script
      if (this.scriptPath.endsWith('extract_securities_cli.py')) {
        args = [
          this.scriptPath,
          '--pdf', pdfPath,
          '--output', tempOutput,
          '--log-file', logFile
        ];
        
        if (this.debug) {
          args.push('--debug');
        }
      } else {
        // We're calling the main script directly
        args = [
          this.scriptPath,
          pdfPath, // Direct path as argument 1
          tempOutput // Output path as argument 2
        ];
      }
      
      // Execute the Python script
      const pythonProcess = spawn('python3', args);
      
      let stdoutData = '';
      let stderrData = '';
      
      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
        if (this.debug) {
          logger.info(`SecurityExtractor stdout: ${data}`);
        }
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        logger.warn(`SecurityExtractor stderr: ${data}`);
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          logger.error(`SecurityExtractor process exited with code ${code}`);
          return reject(new Error(`Securities extraction failed with code ${code}: ${stderrData}`));
        }
        
        // Read the output file
        try {
          if (!fs.existsSync(tempOutput)) {
            return reject(new Error(`Securities extraction output file not found: ${tempOutput}`));
          }
          
          const output = fs.readFileSync(tempOutput, 'utf8');
          fs.unlinkSync(tempOutput); // Clean up
          
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse securities extraction output: ${parseError.message}`));
          }
        } catch (fileError) {
          reject(new Error(`Failed to read securities extraction output: ${fileError.message}`));
        }
      });
      
      pythonProcess.on('error', (error) => {
        logger.error(`SecurityExtractor process error: ${error.message}`);
        reject(new Error(`Securities extraction process error: ${error.message}`));
      });
    });
  }

  /**
   * Validate an ISIN code
   * @param {string} isin - ISIN code to validate
   * @returns {boolean} - Whether the ISIN is valid
   */
  validate_isin(isin) {
    return this.securities_db.validate_isin(isin);
  }

  /**
   * Find securities by name
   * @param {string} name - Name to search for
   * @param {number} limit - Maximum number of results to return
   * @returns {Array<Object>} - Matching securities
   */
  find_securities_by_name(name, limit = 10) {
    return this.securities_db.find_best_match_for_name(name, limit);
  }

  /**
   * Get security name by ISIN
   * @param {string} isin - ISIN code
   * @returns {string|null} - Security name if found, null otherwise
   */
  get_security_name(isin) {
    return this.securities_db.get_name_by_isin(isin);
  }
}

module.exports = SecurityExtractor;