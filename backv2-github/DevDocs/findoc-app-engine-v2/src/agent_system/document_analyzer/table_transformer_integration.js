/**
 * Table Transformer Integration Module
 * 
 * This module provides integration with the Table Transformer model for table structure recognition.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Extract tables from a PDF using Table Transformer
 * @param {string} pdfPath - Path to the PDF file
 * @param {object} options - Extraction options
 * @returns {Promise<Array<object>>} Extracted tables
 */
const extractTablesWithTableTransformer = async (pdfPath, options = {}) => {
  try {
    console.log(`Extracting tables from PDF with Table Transformer: ${pdfPath}`);
    
    // Create temporary directory for output
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'table-transformer-'));
    
    // Create Python script for Table Transformer
    const pythonScript = `
import sys
import os
import json
import torch
from transformers import AutoModelForObjectDetection, AutoImageProcessor
from PIL import Image
import pdf2image
import numpy as np

pdf_path = sys.argv[1]
output_dir = sys.argv[2]
pages = sys.argv[3] if len(sys.argv) > 3 else 'all'

try:
    # Convert PDF to images
    if pages == 'all':
        images = pdf2image.convert_from_path(pdf_path)
    else:
        page_numbers = [int(p) for p in pages.split(',')]
        images = pdf2image.convert_from_path(pdf_path, first_page=min(page_numbers), last_page=max(page_numbers))
    
    # Load model and processor
    processor = AutoImageProcessor.from_pretrained("microsoft/table-transformer-detection")
    model = AutoModelForObjectDetection.from_pretrained("microsoft/table-transformer-detection")
    
    # Process each page
    results = []
    for i, image in enumerate(images):
        # Save image
        image_path = os.path.join(output_dir, f'page_{i+1}.png')
        image.save(image_path)
        
        # Process image
        inputs = processor(images=image, return_tensors="pt")
        outputs = model(**inputs)
        
        # Convert outputs to COCO API
        target_sizes = torch.tensor([image.size[::-1]])
        results_coco = processor.post_process_object_detection(outputs, threshold=0.7, target_sizes=target_sizes)[0]
        
        # Extract table regions
        tables = []
        for box, label, score in zip(results_coco["boxes"], results_coco["labels"], results_coco["scores"]):
            box = [round(i, 2) for i in box.tolist()]
            label_name = model.config.id2label[label.item()]
            
            if label_name == "table":
                # Crop table region
                table_image = image.crop((box[0], box[1], box[2], box[3]))
                table_image_path = os.path.join(output_dir, f'table_{i+1}_{len(tables)+1}.png')
                table_image.save(table_image_path)
                
                tables.append({
                    "page": i + 1,
                    "box": box,
                    "score": round(score.item(), 3),
                    "image_path": table_image_path
                })
        
        # Add to results
        results.append({
            "page": i + 1,
            "image_path": image_path,
            "tables": tables
        })
    
    # Save results as JSON
    with open(os.path.join(output_dir, 'result.json'), 'w') as f:
        json.dump(results, f)
    
    print(json.dumps({
        'success': True,
        'message': f'Processed {len(images)} pages',
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
    const scriptPath = path.join(tempDir, 'table_transformer_extract.py');
    fs.writeFileSync(scriptPath, pythonScript);
    
    // Set options
    const pages = options.pages || 'all';
    
    // Run Python script
    return new Promise((resolve, reject) => {
      const python = spawn('python', [scriptPath, pdfPath, tempDir, pages]);
      
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
          console.error(`Table Transformer process exited with code ${code}`);
          console.error(`Error: ${error}`);
          
          // Clean up
          try {
            fs.rmSync(tempDir, { recursive: true, force: true });
          } catch (err) {
            console.error(`Error cleaning up temporary directory: ${err.message}`);
          }
          
          reject(new Error(`Table Transformer process exited with code ${code}: ${error}`));
          return;
        }
        
        try {
          // Parse output
          const result = JSON.parse(output);
          
          if (!result.success) {
            reject(new Error(`Table Transformer error: ${result.message}`));
            return;
          }
          
          // Read result file
          const resultPath = result.result_path;
          const resultData = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
          
          // Process results
          const tables = [];
          
          for (const page of resultData) {
            for (const table of page.tables) {
              tables.push({
                page: page.page,
                box: table.box,
                score: table.score,
                imagePath: table.image_path
              });
            }
          }
          
          // Clean up (keep files for now for debugging)
          // fs.rmSync(tempDir, { recursive: true, force: true });
          
          resolve({
            tables,
            resultPath: resultPath,
            tempDir: tempDir
          });
        } catch (err) {
          console.error(`Error processing Table Transformer output: ${err.message}`);
          
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
    console.error('Error extracting tables with Table Transformer:', error);
    throw error;
  }
};

/**
 * Check if Table Transformer dependencies are installed
 * @returns {Promise<boolean>} Whether dependencies are installed
 */
const isTableTransformerInstalled = async () => {
  try {
    return new Promise((resolve) => {
      const python = spawn('python', ['-c', 'import torch, transformers, pdf2image']);
      
      python.on('close', (code) => {
        resolve(code === 0);
      });
    });
  } catch (error) {
    console.error('Error checking if Table Transformer dependencies are installed:', error);
    return false;
  }
};

/**
 * Install Table Transformer dependencies
 * @returns {Promise<boolean>} Whether dependencies were installed successfully
 */
const installTableTransformer = async () => {
  try {
    return new Promise((resolve) => {
      const pip = spawn('pip', ['install', 'torch', 'transformers', 'pdf2image', 'pillow']);
      
      pip.on('close', (code) => {
        resolve(code === 0);
      });
    });
  } catch (error) {
    console.error('Error installing Table Transformer dependencies:', error);
    return false;
  }
};

module.exports = {
  extractTablesWithTableTransformer,
  isTableTransformerInstalled,
  installTableTransformer
};
