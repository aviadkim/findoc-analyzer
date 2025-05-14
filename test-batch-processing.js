/**
 * Test Script for Comprehensive Batch Processing
 * 
 * This script tests the functionality of the comprehensive batch processing service
 * by creating batch jobs, monitoring their progress, and verifying results.
 */

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Import batch routes
const comprehensiveBatchRoutes = require('./routes/comprehensive-batch-routes');
const ComprehensiveBatchService = require('./services/comprehensive-batch-service');
const batchService = new ComprehensiveBatchService();

// Create test app
const app = express();
const port = process.env.TEST_PORT || 8081;

// Configure middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure batch routes
app.use('/api/batch', comprehensiveBatchRoutes);

// Test directory setup
const testDir = path.join(__dirname, 'test-data');
const testUploadsDir = path.join(testDir, 'uploads');
const testResultsDir = path.join(testDir, 'results');

// Ensure test directories exist
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}
if (!fs.existsSync(testUploadsDir)) {
  fs.mkdirSync(testUploadsDir, { recursive: true });
}
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

// Sample files for testing
const createSampleFiles = () => {
  // Create PDF file
  const samplePdf = path.join(testUploadsDir, 'sample.pdf');
  if (!fs.existsSync(samplePdf)) {
    console.log('Creating sample PDF file');
    // Create empty PDF-like file
    fs.writeFileSync(samplePdf, '%PDF-1.5\n' + 
      '1 0 obj\n<</Type /Catalog>>\nendobj\n' +
      '2 0 obj\n<</Type /Pages/Count 1>>\nendobj\n' +
      'xref\n0 3\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n' +
      'trailer\n<</Size 3/Root 1 0 R>>\nstartxref\n100\n%%EOF');
  }
  
  // Create Excel file
  const sampleExcel = path.join(testUploadsDir, 'sample.xlsx');
  if (!fs.existsSync(sampleExcel)) {
    console.log('Creating sample Excel file');
    // Create empty Excel-like file
    fs.writeFileSync(sampleExcel, 'PK\x03\x04\x14\x00\x06\x00\x08\x00\x00\x00!\x00\x95J\xF3(5\x01\x00\x00T\x04\x00\x00\x13\x00\x08\x02[Content_Types].xml \xA2\x04\x01(\xA0\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00PK\x01\x02-\x00\x14\x00\x06\x00\x08\x00\x00\x00!\x00\x95J\xF3(5\x01\x00\x00T\x04\x00\x00\x13\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00[Content_Types].xmlPK\x05\x06\x00\x00\x00\x00\x01\x00\x01\x00A\x00\x00\x00v\x01\x00\x00\x00\x00');
  }
  
  // Create text file
  const sampleText = path.join(testUploadsDir, 'sample.txt');
  if (!fs.existsSync(sampleText)) {
    console.log('Creating sample text file');
    fs.writeFileSync(sampleText, 'This is a sample text file for testing batch processing.\n' +
      'It contains mock financial data:\n' +
      'Revenue: $500,000\n' +
      'Expenses: $300,000\n' +
      'Profit: $200,000\n' +
      'Profit Margin: 40%\n\n' +
      'Portfolio Holdings:\n' +
      '- Apple Inc. (AAPL): $150,000\n' +
      '- Microsoft Corp. (MSFT): $120,000\n' +
      '- Amazon.com Inc. (AMZN): $90,000\n');
  }

  // Create sample financial PDFs
  const sampleFinancial = path.join(testUploadsDir, 'financial-report.pdf');
  if (!fs.existsSync(sampleFinancial)) {
    console.log('Creating sample financial PDF file');
    fs.writeFileSync(sampleFinancial, '%PDF-1.5\n' + 
      '1 0 obj\n<</Type /Catalog>>\nendobj\n' +
      '2 0 obj\n<</Type /Pages/Count 1>>\nendobj\n' +
      'xref\n0 3\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n' +
      'trailer\n<</Size 3/Root 1 0 R>>\nstartxref\n100\n%%EOF');
  }
  
  const samplePortfolio = path.join(testUploadsDir, 'portfolio-statement.pdf');
  if (!fs.existsSync(samplePortfolio)) {
    console.log('Creating sample portfolio PDF file');
    fs.writeFileSync(samplePortfolio, '%PDF-1.5\n' + 
      '1 0 obj\n<</Type /Catalog>>\nendobj\n' +
      '2 0 obj\n<</Type /Pages/Count 1>>\nendobj\n' +
      'xref\n0 3\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n' +
      'trailer\n<</Size 3/Root 1 0 R>>\nstartxref\n100\n%%EOF');
  }
  
  return [
    { path: samplePdf, name: 'sample.pdf', type: 'application/pdf' },
    { path: sampleExcel, name: 'sample.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { path: sampleText, name: 'sample.txt', type: 'text/plain' },
    { path: sampleFinancial, name: 'financial-report.pdf', type: 'application/pdf', documentType: 'financial' },
    { path: samplePortfolio, name: 'portfolio-statement.pdf', type: 'application/pdf', documentType: 'portfolio' }
  ];
};

// Test functions
const runTests = async () => {
  try {
    console.log('Starting batch processing tests');
    
    // Create sample files
    const sampleFiles = createSampleFiles();
    
    // Test 1: Create a batch job with low priority
    console.log('\n=== Test 1: Create a batch job with low priority ===');
    const lowPriorityBatch = await batchService.createBatchJob(
      [sampleFiles[0]], // Just one file for this test
      {
        name: 'Low Priority Test',
        priority: 'low',
        userId: 'test-user-1',
        tenantId: 'test-tenant-1',
        processingOptions: {
          extractText: true,
          extractTables: false
        }
      }
    );
    console.log('Created low priority batch:', lowPriorityBatch.id);
    
    // Test 2: Create a batch job with high priority
    console.log('\n=== Test 2: Create a batch job with high priority ===');
    const highPriorityBatch = await batchService.createBatchJob(
      [sampleFiles[1]], // Just one file for this test
      {
        name: 'High Priority Test',
        priority: 'high',
        userId: 'test-user-2',
        tenantId: 'test-tenant-1',
        processingOptions: {
          extractText: true,
          extractTables: true
        },
        // Don't auto queue this job
        autoQueue: false
      }
    );
    console.log('Created high priority batch (not queued):', highPriorityBatch.id);
    
    // Test 3: Create a batch job with multiple files
    console.log('\n=== Test 3: Create a batch job with multiple files ===');
    const multiFileBatch = await batchService.createBatchJob(
      sampleFiles.slice(2, 5), // Three files
      {
        name: 'Multi-File Test',
        priority: 'medium',
        userId: 'test-user-3',
        tenantId: 'test-tenant-2',
        processingOptions: {
          extractText: true,
          extractTables: true,
          extractSecurities: true
        }
      }
    );
    console.log('Created multi-file batch:', multiFileBatch.id);
    
    // Test 4: Queue the high priority batch
    console.log('\n=== Test 4: Queue the high priority batch ===');
    await batchService.queueBatchJob(highPriorityBatch.id);
    console.log('Queued high priority batch');
    
    // Test 5: Get all batch jobs
    console.log('\n=== Test 5: Get all batch jobs ===');
    const allJobs = await batchService.getAllBatchJobs();
    console.log(`Retrieved ${allJobs.length} batch jobs`);
    
    // Test 6: Get batch jobs by tenant
    console.log('\n=== Test 6: Get batch jobs by tenant ===');
    const tenant1Jobs = await batchService.getBatchJobsForTenant('test-tenant-1');
    console.log(`Retrieved ${tenant1Jobs.length} batch jobs for tenant 1`);
    
    // Test 7: Get batch jobs by user
    console.log('\n=== Test 7: Get batch jobs by user ===');
    const user3Jobs = await batchService.getBatchJobsForUser('test-user-3');
    console.log(`Retrieved ${user3Jobs.length} batch jobs for user 3`);
    
    // Test 8: Wait for job processing
    console.log('\n=== Test 8: Wait for job processing ===');
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for processing
    
    // Test 9: Get service stats
    console.log('\n=== Test 9: Get service stats ===');
    const stats = batchService.getServiceStats();
    console.log('Service stats:', JSON.stringify(stats, null, 2));
    
    // Test 10: Get detailed job information
    console.log('\n=== Test 10: Get detailed job information ===');
    const jobDetails = await batchService.getBatchJob(multiFileBatch.id);
    console.log('Multi-file batch details:', JSON.stringify({
      id: jobDetails.id,
      name: jobDetails.name,
      status: jobDetails.status,
      progress: jobDetails.progress,
      processedFiles: jobDetails.processedFiles,
      totalFiles: jobDetails.totalFiles
    }, null, 2));
    
    // Test 11: Cancel a job
    console.log('\n=== Test 11: Cancel a job ===');
    // Create another job to cancel
    const jobToCancel = await batchService.createBatchJob(
      [sampleFiles[0]],
      {
        name: 'Job To Cancel',
        priority: 'low'
      }
    );
    console.log('Created job to cancel:', jobToCancel.id);
    
    // Cancel the job
    await batchService.cancelBatchJob(jobToCancel.id);
    const cancelledJob = await batchService.getBatchJob(jobToCancel.id);
    console.log('Cancelled job status:', cancelledJob.status);
    
    // Test 12: Clean up jobs
    console.log('\n=== Test 12: Clean up jobs ===');
    // Create a job with a very old timestamp
    const oldJob = await batchService.createBatchJob(
      [sampleFiles[0]],
      {
        name: 'Old Job'
      }
    );
    
    // Manually modify the timestamps to make it appear old
    const oldJobData = await batchService.getBatchJob(oldJob.id);
    oldJobData.createdAt = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(); // 31 days ago
    oldJobData.updatedAt = oldJobData.createdAt;
    
    // Complete and mark as old
    oldJobData.status = 'completed';
    oldJobData.processedFiles = oldJobData.totalFiles;
    oldJobData.progress = 100;
    oldJobData.completedAt = oldJobData.createdAt;
    
    // Update in-memory map
    batchService.allJobs.set(oldJob.id, oldJobData);
    
    // Save to disk
    const filePath = path.join(batchService.options.resultsDir, `batch-${oldJob.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(oldJobData, null, 2));
    
    console.log('Created old job:', oldJob.id);
    
    // Run cleanup
    const cleanedCount = await batchService.cleanupBatchJobs(30 * 24 * 60 * 60 * 1000); // 30 days
    console.log(`Cleaned up ${cleanedCount} old jobs`);
    
    // Print overall results
    console.log('\n=== Test Results ===');
    const finalStats = batchService.getServiceStats();
    console.log('Final service stats:', JSON.stringify({
      totalJobs: finalStats.totalJobs,
      completedJobs: finalStats.completedJobs,
      failedJobs: finalStats.failedJobs,
      totalFiles: finalStats.totalFiles,
      processedFiles: finalStats.processedFiles,
      failedFiles: finalStats.failedFiles,
      queues: finalStats.queues
    }, null, 2));
    
    console.log('\nAll batch processing tests completed successfully!');
  } catch (error) {
    console.error('Error during batch processing tests:', error);
  }
};

// Start server for API testing
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
  
  // Run tests after server starts
  setTimeout(runTests, 1000);
});

// Handle termination
process.on('SIGINT', () => {
  console.log('Stopping test server...');
  process.exit(0);
});