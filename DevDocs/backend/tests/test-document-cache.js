/**
 * Document Cache Service Tests
 * 
 * Tests for the document caching functionality.
 */

const path = require('path');
const fs = require('fs');
const { expect } = require('chai');
const crypto = require('crypto');

// Import the CachedSecurityExtractor
const CachedSecurityExtractor = require('../enhanced_processing/security_extractor_cached');

// Test configuration
const TEST_CACHE_DIR = path.resolve(__dirname, './test-cache');
const TEST_PDF_PATH = path.resolve(__dirname, './samples/sample-portfolio.pdf');
const TEST_TENANT_ID = 'test-tenant-' + Date.now();

// Create test directory
if (!fs.existsSync(TEST_CACHE_DIR)) {
  fs.mkdirSync(TEST_CACHE_DIR, { recursive: true });
}

// Prepare a test PDF if one doesn't exist
if (!fs.existsSync(TEST_PDF_PATH)) {
  const testPdfDir = path.dirname(TEST_PDF_PATH);
  if (!fs.existsSync(testPdfDir)) {
    fs.mkdirSync(testPdfDir, { recursive: true });
  }
  
  // Create a simple PDF-like file for testing
  const dummyContent = Buffer.from('%PDF-1.5\nTest PDF content\n%%EOF');
  fs.writeFileSync(TEST_PDF_PATH, dummyContent);
}

// Mock the extract_from_pdf method for testing
class TestSecurityExtractor extends CachedSecurityExtractor {
  constructor(options) {
    super(options);
    this.extractCallCount = 0;
  }
  
  async extract_from_pdf(pdfPath) {
    this.extractCallCount++;
    
    // Return mock data
    return {
      securities: [
        { isin: 'US0378331005', name: 'Apple Inc.', value: 1000 },
        { isin: 'US5949181045', name: 'Microsoft Corp.', value: 2000 }
      ],
      timestamp: new Date().toISOString(),
      document: path.basename(pdfPath)
    };
  }
}

// Test suite
describe('Document Cache Service', function() {
  this.timeout(10000); // Set timeout to 10 seconds
  
  let extractor;
  
  before(() => {
    // Set up the test extractor
    extractor = new TestSecurityExtractor({
      debug: true,
      cacheDir: TEST_CACHE_DIR,
      cacheTtl: 60, // 1 minute
      useTenantIsolation: true
    });
  });
  
  after(() => {
    // Clean up test directory
    if (fs.existsSync(TEST_CACHE_DIR)) {
      fs.rmSync(TEST_CACHE_DIR, { recursive: true, force: true });
    }
  });
  
  it('should generate consistent document fingerprint', () => {
    const fingerprint1 = extractor.generateDocumentFingerprint(TEST_PDF_PATH);
    const fingerprint2 = extractor.generateDocumentFingerprint(TEST_PDF_PATH);
    
    expect(fingerprint1).to.be.a('string');
    expect(fingerprint1.length).to.be.greaterThan(0);
    expect(fingerprint1).to.equal(fingerprint2);
  });
  
  it('should include metadata in document fingerprint', () => {
    const metadata = { documentType: 'portfolio', userId: '12345' };
    
    const fingerprintWithoutMetadata = extractor.generateDocumentFingerprint(TEST_PDF_PATH);
    const fingerprintWithMetadata = extractor.generateDocumentFingerprint(TEST_PDF_PATH, metadata);
    
    expect(fingerprintWithMetadata).to.not.equal(fingerprintWithoutMetadata);
  });
  
  it('should cache document processing results', async () => {
    const result1 = await extractor.extract_from_pdf_cached(TEST_PDF_PATH, {
      tenantId: TEST_TENANT_ID
    });
    
    expect(result1).to.be.an('object');
    expect(result1.securities).to.be.an('array');
    expect(result1.securities.length).to.equal(2);
    expect(extractor.extractCallCount).to.equal(1);
    
    // Extract again to test cache
    const result2 = await extractor.extract_from_pdf_cached(TEST_PDF_PATH, {
      tenantId: TEST_TENANT_ID
    });
    
    expect(result2).to.deep.equal(result1);
    expect(extractor.extractCallCount).to.equal(1); // Should not increase
  });
  
  it('should honor the forceRefresh flag', async () => {
    // Extract with force refresh
    const result = await extractor.extract_from_pdf_cached(TEST_PDF_PATH, {
      tenantId: TEST_TENANT_ID,
      forceRefresh: true
    });
    
    expect(result).to.be.an('object');
    expect(extractor.extractCallCount).to.equal(2); // Should increase
  });
  
  it('should respect tenant isolation', async () => {
    const tenant1 = 'tenant1';
    const tenant2 = 'tenant2';
    
    // Extract for tenant1
    await extractor.extract_from_pdf_cached(TEST_PDF_PATH, {
      tenantId: tenant1
    });
    
    // Extract for tenant2
    await extractor.extract_from_pdf_cached(TEST_PDF_PATH, {
      tenantId: tenant2
    });
    
    expect(extractor.extractCallCount).to.equal(4); // Should increase twice
    
    // Check cache directories were created
    expect(fs.existsSync(path.join(TEST_CACHE_DIR, tenant1))).to.be.true;
    expect(fs.existsSync(path.join(TEST_CACHE_DIR, tenant2))).to.be.true;
  });
  
  it('should invalidate cache entries', async () => {
    const tenantId = 'invalidation-test';
    
    // Extract and cache
    await extractor.extract_from_pdf_cached(TEST_PDF_PATH, { tenantId });
    const initialCallCount = extractor.extractCallCount;
    
    // Generate fingerprint
    const fingerprint = extractor.generateDocumentFingerprint(TEST_PDF_PATH);
    
    // Invalidate the cache
    const invalidated = extractor.invalidateCache(fingerprint, tenantId);
    expect(invalidated).to.be.true;
    
    // Extract again
    await extractor.extract_from_pdf_cached(TEST_PDF_PATH, { tenantId });
    
    // Should have processed again
    expect(extractor.extractCallCount).to.equal(initialCallCount + 1);
  });
  
  it('should provide cache statistics', () => {
    const stats = extractor.getCacheStats();
    
    expect(stats).to.be.an('object');
    expect(stats).to.have.property('totalEntries');
    expect(stats).to.have.property('cacheHits');
    expect(stats).to.have.property('cacheMisses');
    expect(stats).to.have.property('hitRate');
    expect(stats).to.have.property('cacheDirectory');
  });
});

// Run tests if this file is executed directly
if (require.main === module) {
  describe('Document Cache Service Direct Run', function() {
    it('should run tests directly', async () => {
      console.log('Running cache tests...');
      
      // Create extractor
      const extractor = new TestSecurityExtractor({
        debug: true,
        cacheDir: TEST_CACHE_DIR,
        cacheTtl: 60 // 1 minute
      });
      
      // Test fingerprinting
      const fingerprint = extractor.generateDocumentFingerprint(TEST_PDF_PATH);
      console.log(`Document fingerprint: ${fingerprint}`);
      
      // Test caching
      console.log('Testing caching...');
      const result1 = await extractor.extract_from_pdf_cached(TEST_PDF_PATH);
      console.log(`First extraction call count: ${extractor.extractCallCount}`);
      
      const result2 = await extractor.extract_from_pdf_cached(TEST_PDF_PATH);
      console.log(`Second extraction call count: ${extractor.extractCallCount}`);
      
      // Test cache statistics
      const stats = extractor.getCacheStats();
      console.log('Cache stats:', stats);
      
      // Clean up
      if (fs.existsSync(TEST_CACHE_DIR)) {
        fs.rmSync(TEST_CACHE_DIR, { recursive: true, force: true });
      }
      
      console.log('Test completed successfully!');
    });
  });
}