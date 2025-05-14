/**
 * Task Processors
 * 
 * Collection of processor functions for different batch task types.
 * Each processor handles a specific type of task in the batch processing system.
 */

const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

/**
 * Document Processing Task
 * Processes a financial document for extraction and analysis
 */
async function documentProcessingTask(taskData, progressCallback) {
  // Simulate document processing with multiple stages
  const { documentId, options = {} } = taskData;
  
  // Import required services dynamically to avoid circular dependencies
  const documentService = require('../document-processing/document-processing');
  
  try {
    // Step 1: Document preparation (20%)
    progressCallback(5);
    
    // Log task start
    console.log(`[Document Processing] Processing document ${documentId}`);
    
    // Validate document existence
    const documentExists = await documentService.checkDocumentExists(documentId);
    
    if (!documentExists) {
      throw new Error(`Document ${documentId} not found`);
    }
    
    progressCallback(10);
    
    // Get document metadata
    const metadata = await documentService.getDocumentMetadata(documentId);
    progressCallback(20);
    
    // Step 2: Text extraction (40%)
    const textExtractionOptions = {
      performOcr: options.performOcr === true,
      language: options.language || 'auto',
      enhancedMode: options.enhancedMode === true
    };
    
    const extractedText = await documentService.extractDocumentText(
      documentId, 
      textExtractionOptions
    );
    
    progressCallback(40);
    
    // Step 3: Table detection and extraction (60%)
    const tableExtractionOptions = {
      detectTables: options.detectTables !== false,
      enhancedTableExtraction: options.enhancedTableExtraction === true
    };
    
    const extractedTables = await documentService.extractDocumentTables(
      documentId, 
      tableExtractionOptions
    );
    
    progressCallback(60);
    
    // Step 4: Securities extraction (80%)
    const securitiesExtractionOptions = {
      extractSecurities: options.extractSecurities !== false,
      enhancedSecuritiesExtraction: options.enhancedSecuritiesExtraction === true,
      useReferenceDb: options.useReferenceDb !== false
    };
    
    const extractedSecurities = await documentService.extractSecurities(
      documentId,
      extractedText,
      extractedTables,
      securitiesExtractionOptions
    );
    
    progressCallback(80);
    
    // Step 5: Document analysis and results preparation (100%)
    const analysisOptions = {
      performAnalysis: options.performAnalysis !== false,
      generateSummary: options.generateSummary !== false,
      detectedDocumentType: metadata.documentType || 'unknown'
    };
    
    const analysisResults = await documentService.analyzeDocument(
      documentId,
      extractedText,
      extractedTables,
      extractedSecurities,
      analysisOptions
    );
    
    progressCallback(95);
    
    // Prepare final results
    const results = {
      documentId,
      metadata,
      textExtractionResults: {
        charCount: extractedText.length,
        pageCount: metadata.pageCount || 1
      },
      tableExtractionResults: {
        tableCount: extractedTables.length,
        tables: extractedTables.map(table => ({
          id: table.id,
          rowCount: table.rows.length,
          columnCount: table.columns.length
        }))
      },
      securitiesExtractionResults: {
        securitiesCount: extractedSecurities.length,
        securities: extractedSecurities.map(security => ({
          id: security.id,
          name: security.name,
          identifiers: security.identifiers,
          quantity: security.quantity,
          value: security.value
        }))
      },
      analysisResults: {
        documentType: analysisResults.documentType,
        summary: analysisResults.summary,
        keyMetrics: analysisResults.keyMetrics
      }
    };
    
    progressCallback(100);
    
    // Log task completion
    console.log(`[Document Processing] Completed processing document ${documentId}`);
    
    return results;
  } catch (error) {
    console.error(`[Document Processing] Error processing document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Data Export Task
 * Exports processed document data to various formats
 */
async function dataExportTask(taskData, progressCallback) {
  const { documentId, exportFormat, options = {} } = taskData;
  
  // Import required services dynamically
  const exportService = require('../export/exportService');
  
  try {
    // Step 1: Data preparation (30%)
    progressCallback(10);
    
    // Log task start
    console.log(`[Data Export] Exporting document ${documentId} to ${exportFormat}`);
    
    // Get document data
    const documentData = await exportService.getDocumentData(documentId);
    progressCallback(30);
    
    // Step 2: Format conversion (70%)
    // Determine export format
    let exportResult;
    
    switch (exportFormat.toLowerCase()) {
      case 'json':
        exportResult = await exportService.exportToJson(documentData, options);
        break;
        
      case 'csv':
        exportResult = await exportService.exportToCsv(documentData, options);
        break;
        
      case 'xlsx':
        exportResult = await exportService.exportToExcel(documentData, options);
        break;
        
      case 'pdf':
        exportResult = await exportService.exportToPdf(documentData, options);
        break;
        
      default:
        throw new Error(`Unsupported export format: ${exportFormat}`);
    }
    
    progressCallback(70);
    
    // Step 3: Export storage (100%)
    // Save exported data to storage
    const storageOptions = {
      userId: options.userId,
      saveToStorage: options.saveToStorage !== false,
      path: options.path || `exports/${documentId}`,
      includeTimestamp: options.includeTimestamp !== false
    };
    
    const storageResult = await exportService.saveExportToStorage(
      exportResult,
      exportFormat,
      storageOptions
    );
    
    progressCallback(100);
    
    // Log task completion
    console.log(`[Data Export] Completed exporting document ${documentId} to ${exportFormat}`);
    
    // Return export results
    return {
      documentId,
      exportFormat,
      fileSize: exportResult.size,
      storagePath: storageResult.path,
      downloadUrl: storageResult.downloadUrl,
      exportTimestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`[Data Export] Error exporting document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Document Comparison Task
 * Compares multiple financial documents
 */
async function documentComparisonTask(taskData, progressCallback) {
  const { documentIds, comparisonType, options = {} } = taskData;
  
  // Import required services dynamically
  const comparisonService = require('../comparison/comparisonService');
  
  try {
    // Validate input
    if (!Array.isArray(documentIds) || documentIds.length < 2) {
      throw new Error('At least two document IDs are required for comparison');
    }
    
    // Step 1: Data preparation (20%)
    progressCallback(5);
    
    // Log task start
    console.log(`[Document Comparison] Comparing documents: ${documentIds.join(', ')}`);
    
    // Validate documents existence
    const documents = await Promise.all(
      documentIds.map(async id => {
        const document = await comparisonService.getDocumentForComparison(id);
        
        if (!document) {
          throw new Error(`Document ${id} not found or not available for comparison`);
        }
        
        return document;
      })
    );
    
    progressCallback(20);
    
    // Step 2: Perform comparison based on comparison type (70%)
    let comparisonResults;
    
    switch (comparisonType.toLowerCase()) {
      case 'holdings':
        comparisonResults = await comparisonService.compareHoldings(documents, options);
        break;
        
      case 'performance':
        comparisonResults = await comparisonService.comparePerformance(documents, options);
        break;
        
      case 'allocation':
        comparisonResults = await comparisonService.compareAllocation(documents, options);
        break;
        
      case 'complete':
        comparisonResults = await comparisonService.performCompleteComparison(documents, options);
        break;
        
      default:
        throw new Error(`Unsupported comparison type: ${comparisonType}`);
    }
    
    progressCallback(70);
    
    // Step 3: Generate comparison report (100%)
    const reportOptions = {
      includeCharts: options.includeCharts !== false,
      includeDetailedDifferences: options.includeDetailedDifferences !== false,
      normalizeDates: options.normalizeDates !== false,
      generatePdf: options.generatePdf === true
    };
    
    const comparisonReport = await comparisonService.generateComparisonReport(
      comparisonResults,
      reportOptions
    );
    
    progressCallback(100);
    
    // Log task completion
    console.log(`[Document Comparison] Completed comparison for documents: ${documentIds.join(', ')}`);
    
    // Return comparison results
    return {
      documentIds,
      comparisonType,
      timestamp: new Date().toISOString(),
      summary: comparisonReport.summary,
      keyFindings: comparisonReport.keyFindings,
      detailedResults: comparisonReport.detailedResults,
      reportUrl: comparisonReport.reportUrl
    };
  } catch (error) {
    console.error(`[Document Comparison] Error comparing documents: ${error.message}`);
    throw error;
  }
}

/**
 * Portfolio Analysis Task
 * Performs detailed analysis on portfolio documents
 */
async function portfolioAnalysisTask(taskData, progressCallback) {
  const { documentId, analysisTypes = ['complete'], options = {} } = taskData;
  
  // Import required services dynamically
  const portfolioService = require('../portfolio/portfolioService');
  
  try {
    // Step 1: Data preparation (20%)
    progressCallback(5);
    
    // Log task start
    console.log(`[Portfolio Analysis] Analyzing portfolio document ${documentId}`);
    
    // Get portfolio data
    const portfolioData = await portfolioService.getPortfolioData(documentId);
    
    if (!portfolioData) {
      throw new Error(`Portfolio data not found for document ${documentId}`);
    }
    
    progressCallback(20);
    
    // Step 2: Perform requested analyses (80%)
    const analysisResults = {};
    let completedAnalyses = 0;
    const totalAnalyses = analysisTypes.includes('complete') ? 
      1 : analysisTypes.length;
    
    // Handle 'complete' analysis type specially
    if (analysisTypes.includes('complete')) {
      analysisResults.complete = await portfolioService.performCompleteAnalysis(
        portfolioData,
        options
      );
      
      progressCallback(80);
    } else {
      // Perform each requested analysis type
      for (const analysisType of analysisTypes) {
        switch (analysisType) {
          case 'asset_allocation':
            analysisResults.assetAllocation = await portfolioService.analyzeAssetAllocation(
              portfolioData,
              options
            );
            break;
            
          case 'sector_breakdown':
            analysisResults.sectorBreakdown = await portfolioService.analyzeSectorBreakdown(
              portfolioData,
              options
            );
            break;
            
          case 'risk_metrics':
            analysisResults.riskMetrics = await portfolioService.analyzeRiskMetrics(
              portfolioData,
              options
            );
            break;
            
          case 'performance':
            analysisResults.performance = await portfolioService.analyzePerformance(
              portfolioData,
              options
            );
            break;
            
          case 'geographic_exposure':
            analysisResults.geographicExposure = await portfolioService.analyzeGeographicExposure(
              portfolioData,
              options
            );
            break;
            
          default:
            // Skip unknown analysis type
            console.warn(`Unknown analysis type: ${analysisType}`);
            continue;
        }
        
        // Update progress
        completedAnalyses++;
        const progress = 20 + (completedAnalyses / totalAnalyses) * 60;
        progressCallback(Math.floor(progress));
      }
    }
    
    // Step 3: Generate analysis report (100%)
    const reportOptions = {
      includeCharts: options.includeCharts !== false,
      includeBenchmarkComparison: options.includeBenchmarkComparison !== false,
      benchmarkIndex: options.benchmarkIndex || 'S&P500',
      period: options.period || 'all'
    };
    
    const analysisReport = await portfolioService.generateAnalysisReport(
      analysisResults,
      reportOptions
    );
    
    progressCallback(100);
    
    // Log task completion
    console.log(`[Portfolio Analysis] Completed analysis for document ${documentId}`);
    
    // Return analysis results
    return {
      documentId,
      analysisTypes,
      timestamp: new Date().toISOString(),
      summary: analysisReport.summary,
      keyFindings: analysisReport.keyFindings,
      metrics: analysisReport.metrics,
      charts: analysisReport.charts ? analysisReport.charts.map(chart => chart.id) : [],
      reportUrl: analysisReport.reportUrl
    };
  } catch (error) {
    console.error(`[Portfolio Analysis] Error analyzing portfolio document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Bulk Import Task
 * Imports multiple documents in bulk
 */
async function bulkImportTask(taskData, progressCallback) {
  const { documents, options = {} } = taskData;
  
  // Import required services dynamically
  const importService = require('../import/importService');
  
  try {
    // Validate input
    if (!Array.isArray(documents) || documents.length === 0) {
      throw new Error('No documents provided for bulk import');
    }
    
    // Step 1: Preparation and validation (10%)
    progressCallback(5);
    
    // Log task start
    console.log(`[Bulk Import] Importing ${documents.length} documents`);
    
    // Validate import options
    const importOptions = {
      userId: options.userId,
      skipDuplicates: options.skipDuplicates !== false,
      autoProcessing: options.autoProcessing !== false,
      createFolder: options.createFolder === true,
      folderName: options.folderName || `Bulk Import ${new Date().toISOString()}`,
      ...options
    };
    
    progressCallback(10);
    
    // Step 2: Process each document (90%)
    const importResults = [];
    let completedImports = 0;
    const totalImports = documents.length;
    
    for (const document of documents) {
      try {
        // Import document
        const importResult = await importService.importDocument(document, importOptions);
        importResults.push({
          documentId: importResult.documentId,
          status: 'success',
          filename: document.filename || 'unknown',
          metadata: importResult.metadata
        });
      } catch (error) {
        // Record failed import
        importResults.push({
          documentId: null,
          status: 'failed',
          filename: document.filename || 'unknown',
          error: error.message
        });
      }
      
      // Update progress
      completedImports++;
      const progress = 10 + (completedImports / totalImports) * 80;
      progressCallback(Math.floor(progress));
    }
    
    // Step 3: Finalize import (100%)
    const successCount = importResults.filter(result => result.status === 'success').length;
    const failureCount = totalImports - successCount;
    
    // Generate import summary report
    const importSummary = await importService.generateImportSummary(importResults, importOptions);
    
    progressCallback(100);
    
    // Log task completion
    console.log(`[Bulk Import] Completed importing ${successCount} documents (${failureCount} failed)`);
    
    // Return import results
    return {
      totalDocuments: totalImports,
      successCount,
      failureCount,
      results: importResults,
      summary: importSummary,
      importTimestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`[Bulk Import] Error during bulk import:`, error);
    throw error;
  }
}

/**
 * Test task processor for testing and debugging
 */
async function testTask(taskData, progressCallback) {
  // Simple test task that simulates a long-running operation
  try {
    console.log(`[Test Task] Starting test task with data:`, taskData);
    
    const steps = taskData.steps || 10;
    const delay = taskData.delay || 500; // ms per step
    
    // Simulate multiple processing steps
    for (let i = 0; i < steps; i++) {
      // Sleep to simulate processing time
      await sleep(delay);
      
      // Calculate progress percentage
      const progress = Math.floor(((i + 1) / steps) * 100);
      
      // Report progress
      progressCallback(progress);
      
      console.log(`[Test Task] Step ${i + 1}/${steps} (${progress}% complete)`);
    }
    
    // Return test result
    return {
      message: taskData.message || 'Test task completed successfully',
      processingTime: steps * delay,
      steps,
      delay,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`[Test Task] Error in test task:`, error);
    throw error;
  }
}

// Export all task processors
const processors = {
  'document-processing': documentProcessingTask,
  'data-export': dataExportTask,
  'document-comparison': documentComparisonTask,
  'portfolio-analysis': portfolioAnalysisTask,
  'bulk-import': bulkImportTask,
  'test': testTask
};

module.exports = {
  processors
};