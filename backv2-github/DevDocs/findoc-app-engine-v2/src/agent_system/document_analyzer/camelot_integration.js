/**
 * Camelot Integration Module
 * 
 * This module provides integration with the Camelot Python library for table extraction from PDFs.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Extract tables from a PDF using Camelot
 * @param {string} pdfPath - Path to the PDF file
 * @param {object} options - Extraction options
 * @returns {Promise<Array<object>>} Extracted tables
 */
const extractTablesWithCamelot = async (pdfPath, options = {}) => {
  try {
    console.log(`Extracting tables from PDF with Camelot: ${pdfPath}`);
    
    // Create temporary directory for output
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'camelot-'));
    
    // Create Python script for Camelot
    const pythonScript = `
import camelot
import json
import sys
import os

pdf_path = sys.argv[1]
output_dir = sys.argv[2]
flavor = sys.argv[3] if len(sys.argv) > 3 else 'lattice'
pages = sys.argv[4] if len(sys.argv) > 4 else 'all'

try:
    # Extract tables
    tables = camelot.read_pdf(pdf_path, flavor=flavor, pages=pages)
    
    # Save results
    result = []
    for i, table in enumerate(tables):
        # Save table as CSV
        csv_path = os.path.join(output_dir, f'table_{i+1}.csv')
        table.to_csv(csv_path)
        
        # Get table data
        data = table.df.values.tolist()
        
        # Get table metadata
        metadata = {
            'accuracy': table.accuracy,
            'whitespace': table.whitespace,
            'order': table.order,
            'page': table.page,
            'flavor': table.flavor,
            'table_areas': table.table_areas,
            'columns': table.columns,
            'rows': table.rows,
            'shape': table.shape,
            'csv_path': csv_path
        }
        
        # Add to result
        result.append({
            'data': data,
            'metadata': metadata
        })
    
    # Save result as JSON
    with open(os.path.join(output_dir, 'result.json'), 'w') as f:
        json.dump(result, f)
    
    print(json.dumps({
        'success': True,
        'message': f'Extracted {len(tables)} tables',
        'result_path': os.path.join(output_dir, 'result.json')
    }))
except Exception as e:
    print(json.dumps({
        'success': False,
        'message': str(e)
    }))
    sys.exit(1)
`;
    
    // Write Python script to temporary file
    const scriptPath = path.join(tempDir, 'camelot_extract.py');
    fs.writeFileSync(scriptPath, pythonScript);
    
    // Set options
    const flavor = options.flavor || 'lattice';
    const pages = options.pages || 'all';
    
    // Run Python script
    return new Promise((resolve, reject) => {
      const python = spawn('python', [scriptPath, pdfPath, tempDir, flavor, pages]);
      
      let output = '';
      let error = '';
      
      python.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      python.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      python.on('close', (code) => {
        if (code !== 0) {
          console.error(`Camelot process exited with code ${code}`);
          console.error(`Error: ${error}`);
          
          // Clean up
          try {
            fs.rmSync(tempDir, { recursive: true, force: true });
          } catch (err) {
            console.error(`Error cleaning up temporary directory: ${err.message}`);
          }
          
          reject(new Error(`Camelot process exited with code ${code}: ${error}`));
          return;
        }
        
        try {
          // Parse output
          const result = JSON.parse(output);
          
          if (!result.success) {
            reject(new Error(`Camelot error: ${result.message}`));
            return;
          }
          
          // Read result file
          const resultPath = result.result_path;
          const resultData = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
          
          // Process tables
          const tables = resultData.map((table, index) => {
            // Read CSV file
            const csvPath = table.metadata.csv_path;
            const csvContent = fs.readFileSync(csvPath, 'utf8');
            
            // Convert data to structured format
            const headers = table.data[0] || [];
            const rows = table.data.slice(1) || [];
            
            return {
              index: index + 1,
              page: table.metadata.page,
              headers,
              rows,
              data: table.data,
              csv: csvContent,
              accuracy: table.metadata.accuracy,
              shape: table.metadata.shape
            };
          });
          
          // Clean up
          try {
            fs.rmSync(tempDir, { recursive: true, force: true });
          } catch (err) {
            console.error(`Error cleaning up temporary directory: ${err.message}`);
          }
          
          resolve(tables);
        } catch (err) {
          console.error(`Error processing Camelot output: ${err.message}`);
          
          // Clean up
          try {
            fs.rmSync(tempDir, { recursive: true, force: true });
          } catch (cleanupErr) {
            console.error(`Error cleaning up temporary directory: ${cleanupErr.message}`);
          }
          
          reject(err);
        }
      });
    });
  } catch (error) {
    console.error('Error extracting tables with Camelot:', error);
    throw error;
  }
};

/**
 * Check if Camelot is installed
 * @returns {Promise<boolean>} Whether Camelot is installed
 */
const isCamelotInstalled = async () => {
  try {
    return new Promise((resolve) => {
      const python = spawn('python', ['-c', 'import camelot']);
      
      python.on('close', (code) => {
        resolve(code === 0);
      });
    });
  } catch (error) {
    console.error('Error checking if Camelot is installed:', error);
    return false;
  }
};

/**
 * Install Camelot if not installed
 * @returns {Promise<boolean>} Whether Camelot was installed successfully
 */
const installCamelot = async () => {
  try {
    return new Promise((resolve) => {
      const pip = spawn('pip', ['install', 'camelot-py[cv]', 'opencv-python', 'ghostscript']);
      
      pip.on('close', (code) => {
        resolve(code === 0);
      });
    });
  } catch (error) {
    console.error('Error installing Camelot:', error);
    return false;
  }
};

module.exports = {
  extractTablesWithCamelot,
  isCamelotInstalled,
  installCamelot
};
