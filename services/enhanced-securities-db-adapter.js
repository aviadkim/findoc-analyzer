/**
 * Enhanced Securities Database Adapter
 * 
 * This module provides an adapter to integrate the enhanced Python-based
 * securities reference database with the JavaScript document processing pipeline.
 * It uses a child process to communicate with the Python implementation.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const logger = require('../utils/logger').getLogger('enhancedSecuritiesDbAdapter');

class EnhancedSecuritiesDbAdapter {
  /**
   * Initialize the adapter for the enhanced securities reference database
   * @param {Object} options - Configuration options
   * @param {string} options.pythonPath - Path to the Python executable
   * @param {string} options.scriptPath - Path to the integration script
   * @param {string} options.configPath - Path to the database configuration
   * @param {boolean} options.debug - Enable debug mode
   */
  constructor(options = {}) {
    this.pythonPath = options.pythonPath || 'python';
    this.scriptPath = options.scriptPath || path.join(__dirname, '../integrate_enhanced_securities_db.py');
    this.configPath = options.configPath || path.join(__dirname, '../securities_db_config.json');
    this.debug = options.debug || false;

    // Verify paths exist
    this._verifyPaths();
  }

  /**
   * Verify that all required paths exist
   * @private
   */
  async _verifyPaths() {
    try {
      // Check if integration script exists
      await fs.access(this.scriptPath);
      logger.info(`Integration script found at: ${this.scriptPath}`);

      // Check if config exists
      await fs.access(this.configPath);
      logger.info(`Config file found at: ${this.configPath}`);

      // Check Python version
      const { stdout } = await exec(`${this.pythonPath} --version`);
      logger.info(`Using Python: ${stdout.trim()}`);

      // Verify Python dependencies
      const moduleCheckCmd = `${this.pythonPath} -c "import sys, json; sys.path.append('${path.dirname(this.scriptPath)}'); ` +
                           `from enhanced_securities_reference_db import SecuritiesReferenceDB; ` +
                           `print('Dependencies OK')"`;
                           
      await exec(moduleCheckCmd);
      logger.info('All Python dependencies verified');
    } catch (error) {
      logger.error(`Path verification failed: ${error.message}`);
      throw new Error(`Failed to initialize enhanced securities database: ${error.message}`);
    }
  }

  /**
   * Process a PDF with the enhanced extractor
   * @param {string} pdfPath - Path to the PDF file
   * @param {Object} options - Processing options
   * @param {string} options.outputPath - Optional path to save output JSON
   * @returns {Promise<Object>} Extracted securities data
   */
  async processFile(pdfPath, options = {}) {
    try {
      logger.info(`Processing file: ${pdfPath}`);

      // Create temporary output path if not provided
      const outputPath = options.outputPath || path.join(
        require('os').tmpdir(),
        `enhanced-securities-${Date.now()}.json`
      );

      // Build arguments
      const args = [
        this.scriptPath,
        '--pdf', pdfPath,
        '--config', this.configPath,
        '--output', outputPath
      ];

      if (this.debug) {
        args.push('--verbose');
      }

      // Run the Python script
      const process = spawn(this.pythonPath, args);
      
      return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        
        process.stdout.on('data', (data) => {
          stdout += data.toString();
          if (this.debug) {
            logger.debug(`Python stdout: ${data.toString()}`);
          }
        });
        
        process.stderr.on('data', (data) => {
          stderr += data.toString();
          logger.error(`Python stderr: ${data.toString()}`);
        });
        
        process.on('close', async (code) => {
          if (code !== 0) {
            reject(new Error(`Process exited with code ${code}: ${stderr}`));
            return;
          }
          
          try {
            // Read the output file
            const jsonData = await fs.readFile(outputPath, 'utf8');
            const result = JSON.parse(jsonData);
            
            // Clean up temporary file if not specified by user
            if (!options.outputPath) {
              await fs.unlink(outputPath).catch(e => logger.warn(`Failed to delete temp file: ${e.message}`));
            }
            
            logger.info(`Successfully processed file: ${pdfPath}`);
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to read output: ${error.message}`));
          }
        });
      });
    } catch (error) {
      logger.error(`Failed to process file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Compare basic and enhanced extraction methods
   * @param {string} pdfPath - Path to the PDF file
   * @returns {Promise<Object>} Comparison results
   */
  async compareExtractions(pdfPath) {
    try {
      logger.info(`Comparing extractions for: ${pdfPath}`);

      // Build arguments
      const args = [
        this.scriptPath,
        '--pdf', pdfPath,
        '--config', this.configPath,
        '--compare'
      ];

      if (this.debug) {
        args.push('--verbose');
      }

      // Run the Python script
      const process = spawn(this.pythonPath, args);
      
      return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        
        process.stdout.on('data', (data) => {
          stdout += data.toString();
          if (this.debug) {
            logger.debug(`Python stdout: ${data.toString()}`);
          }
        });
        
        process.stderr.on('data', (data) => {
          stderr += data.toString();
          logger.error(`Python stderr: ${data.toString()}`);
        });
        
        process.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`Process exited with code ${code}: ${stderr}`));
            return;
          }
          
          // Extract comparison from stdout (simple approach)
          logger.info(`Successfully compared extractions for: ${pdfPath}`);
          resolve({
            basic: {
              extractionCompleted: true
            },
            enhanced: {
              extractionCompleted: true
            },
            comparisonOutput: stdout
          });
        });
      });
    } catch (error) {
      logger.error(`Failed to compare extractions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Look up security information by ISIN
   * @param {string} isin - ISIN to look up
   * @returns {Promise<Object>} Security information
   */
  async getSecurityByIsin(isin) {
    try {
      logger.info(`Looking up security by ISIN: ${isin}`);

      // Create a simple Python script to execute the lookup
      const scriptContent = `
import sys
import json
sys.path.append('${path.dirname(this.scriptPath)}')
from enhanced_securities_reference_db import SecuritiesReferenceDB

db = SecuritiesReferenceDB('${this.configPath}')
result = db.get_security_info('${isin}')
print(json.dumps(result))
      `;

      const tempScriptPath = path.join(
        require('os').tmpdir(),
        `isin-lookup-${Date.now()}.py`
      );

      await fs.writeFile(tempScriptPath, scriptContent);
      
      try {
        const { stdout, stderr } = await exec(`${this.pythonPath} ${tempScriptPath}`);
        
        if (stderr) {
          logger.warn(`Python stderr during ISIN lookup: ${stderr}`);
        }
        
        const result = JSON.parse(stdout);
        return result;
      } finally {
        // Clean up temp script
        await fs.unlink(tempScriptPath).catch(e => 
          logger.warn(`Failed to delete temp script: ${e.message}`)
        );
      }
    } catch (error) {
      logger.error(`Failed to look up security by ISIN: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find securities by name using fuzzy matching
   * @param {string} name - Security name to match
   * @returns {Promise<Object>} Best match information
   */
  async findSecurityByName(name) {
    try {
      logger.info(`Finding security by name: ${name}`);

      // Create a simple Python script to execute the lookup
      const scriptContent = `
import sys
import json
sys.path.append('${path.dirname(this.scriptPath)}')
from enhanced_securities_reference_db import SecuritiesReferenceDB

db = SecuritiesReferenceDB('${this.configPath}')
result = db.find_best_match_for_name(${JSON.stringify(name)})
print(json.dumps(result if result else {}))
      `;

      const tempScriptPath = path.join(
        require('os').tmpdir(),
        `name-lookup-${Date.now()}.py`
      );

      await fs.writeFile(tempScriptPath, scriptContent);
      
      try {
        const { stdout, stderr } = await exec(`${this.pythonPath} ${tempScriptPath}`);
        
        if (stderr) {
          logger.warn(`Python stderr during name lookup: ${stderr}`);
        }
        
        const result = JSON.parse(stdout);
        return result;
      } finally {
        // Clean up temp script
        await fs.unlink(tempScriptPath).catch(e => 
          logger.warn(`Failed to delete temp script: ${e.message}`)
        );
      }
    } catch (error) {
      logger.error(`Failed to find security by name: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get database statistics
   * @returns {Promise<Object>} Database statistics
   */
  async getDatabaseStats() {
    try {
      logger.info('Getting database statistics');

      // Create a simple Python script to get statistics
      const scriptContent = `
import sys
import json
sys.path.append('${path.dirname(this.scriptPath)}')
from enhanced_securities_reference_db import SecuritiesReferenceDB

db = SecuritiesReferenceDB('${this.configPath}')
stats = {
    'total_securities': len(db.isin_to_name),
    'total_tickers': len(db.ticker_to_name),
    'security_types': {
        'equity': len([isin for isin, type_val in db.isin_to_security_type.items() if type_val == 'equity']),
        'bond': len([isin for isin, type_val in db.isin_to_security_type.items() if type_val == 'bond']),
        'etf': len([isin for isin, type_val in db.isin_to_security_type.items() if type_val == 'etf']),
        'fund': len([isin for isin, type_val in db.isin_to_security_type.items() if type_val == 'fund']),
        'other': len([isin for isin, type_val in db.isin_to_security_type.items() if type_val not in ('equity', 'bond', 'etf', 'fund')])
    },
    'data_sources': list(db.data_sources),
    'last_update': db.last_update
}
print(json.dumps(stats))
      `;

      const tempScriptPath = path.join(
        require('os').tmpdir(),
        `db-stats-${Date.now()}.py`
      );

      await fs.writeFile(tempScriptPath, scriptContent);
      
      try {
        const { stdout, stderr } = await exec(`${this.pythonPath} ${tempScriptPath}`);
        
        if (stderr) {
          logger.warn(`Python stderr during stats lookup: ${stderr}`);
        }
        
        const result = JSON.parse(stdout);
        return result;
      } finally {
        // Clean up temp script
        await fs.unlink(tempScriptPath).catch(e => 
          logger.warn(`Failed to delete temp script: ${e.message}`)
        );
      }
    } catch (error) {
      logger.error(`Failed to get database stats: ${error.message}`);
      throw error;
    }
  }
}

module.exports = EnhancedSecuritiesDbAdapter;