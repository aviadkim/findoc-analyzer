/**
 * MCP Services Demo for Financial PDF Processing
 *
 * This script demonstrates how to use MCP services for PDF document processing
 * in a real-world financial application.
 */

const fs = require('fs');
const path = require('path');
const documentProcessorMcp = require('./demo-mcp-document-processor');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Financial Document Analyzer
 *
 * This class demonstrates how to use the Document Processor MCP
 * in a real-world financial application.
 */
class FinancialDocumentAnalyzer {
  /**
   * Initialize the financial document analyzer
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      resultPath: path.join(__dirname, 'outputs'),
      ...options
    };

    // Create the result directory if it doesn't exist
    if (!fs.existsSync(this.options.resultPath)) {
      fs.mkdirSync(this.options.resultPath, { recursive: true });
      console.log(`Created result directory: ${this.options.resultPath}`);
    }

    // Initialize the processor MCP
    this.processor = documentProcessorMcp;

    console.log('Financial Document Analyzer initialized.');
    console.log(`MCP Status: ${JSON.stringify(this.processor.getStatus())}`);
  }

  /**
   * Analyze a financial document
   * @param {string} filePath - Path to the financial document
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeDocument(filePath) {
    console.log(`${colors.bright}Analyzing financial document: ${filePath}${colors.reset}`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    try {
      // Step 1: Process the document using MCP
      console.log(`${colors.blue}Step 1: Processing document with MCP...${colors.reset}`);
      const processingResult = await this.processor.processDocument(filePath);

      // Step 2: Analyze the document
      console.log(`${colors.blue}Step 2: Analyzing document content...${colors.reset}`);
      const analysisResult = this.analyzeDocumentContent(processingResult);

      // Step 3: Generate financial report
      console.log(`${colors.blue}Step 3: Generating financial report...${colors.reset}`);
      const reportResult = this.generateFinancialReport(analysisResult);

      // Save the results
      const outputPath = path.join(this.options.resultPath, `${processingResult.documentId}-analysis.json`);
      fs.writeFileSync(outputPath, JSON.stringify({
        documentId: processingResult.documentId,
        fileName: processingResult.fileName,
        processingDate: processingResult.processingDate,
        analysisResult,
        reportResult
      }, null, 2));

      console.log(`${colors.green}Analysis completed successfully.${colors.reset}`);
      console.log(`Results saved to: ${outputPath}`);

      return {
        documentId: processingResult.documentId,
        fileName: processingResult.fileName,
        analysisResult,
        reportResult
      };
    } catch (error) {
      console.error(`${colors.red}Error analyzing document: ${error.message}${colors.reset}`);
      throw error;
    }
  }

  /**
   * Analyze document content
   * @param {Object} processingResult - Processing result from MCP
   * @returns {Object} - Analysis result
   */
  analyzeDocumentContent(processingResult) {
    console.log('Analyzing document content...');

    // Extract securities
    const securities = processingResult.securities || [];

    // Calculate total portfolio value
    const totalValue = securities.reduce((total, security) => {
      return total + (security.marketValue || 0);
    }, 0);

    // Calculate asset allocation by company
    const assetAllocation = {};
    securities.forEach(security => {
      if (security.marketValue) {
        assetAllocation[security.name] = {
          value: security.marketValue,
          percentage: (security.marketValue / totalValue) * 100
        };
      }
    });

    // Extract important metrics
    const metrics = processingResult.entities
      .filter(entity => entity.type === 'metric')
      .map(metric => ({
        name: metric.name,
        value: metric.value,
        confidence: metric.confidence
      }));

    return {
      totalPortfolioValue: totalValue,
      securitiesCount: securities.length,
      assetAllocation,
      metrics,
      analysisDate: new Date().toISOString()
    };
  }

  /**
   * Generate a financial report
   * @param {Object} analysisResult - Analysis result
   * @returns {Object} - Financial report
   */
  generateFinancialReport(analysisResult) {
    console.log('Generating financial report...');

    // Generate portfolio summary
    const portfolioSummary = {
      totalValue: analysisResult.totalPortfolioValue,
      assetCount: analysisResult.securitiesCount,
      topHoldings: Object.entries(analysisResult.assetAllocation)
        .sort((a, b) => b[1].value - a[1].value)
        .slice(0, 5)
        .map(([name, data]) => ({
          name,
          value: data.value,
          percentage: data.percentage
        }))
    };

    // Generate risk assessment
    const riskAssessment = {
      diversificationScore: this.calculateDiversificationScore(analysisResult),
      volatilityScore: Math.random() * 100, // Mock score for demo
      recommendedActions: [
        "Consider rebalancing portfolio to improve diversification",
        "Review investment strategy for long-term growth"
      ]
    };

    return {
      portfolioSummary,
      riskAssessment,
      generatedDate: new Date().toISOString()
    };
  }

  /**
   * Calculate diversification score
   * @param {Object} analysisResult - Analysis result
   * @returns {number} - Diversification score (0-100)
   */
  calculateDiversificationScore(analysisResult) {
    // Simple algorithm for diversification score
    // In a real implementation, this would be more sophisticated
    const allocationCount = Object.keys(analysisResult.assetAllocation).length;

    // More assets = better diversification
    let diversificationScore = Math.min(allocationCount * 10, 100);

    // Penalize if a single asset makes up more than 20% of the portfolio
    for (const [, allocation] of Object.entries(analysisResult.assetAllocation)) {
      if (allocation.percentage > 20) {
        diversificationScore -= (allocation.percentage - 20) / 2;
      }
    }

    return Math.max(0, Math.min(100, diversificationScore));
  }

  /**
   * Print a financial report to the console
   * @param {Object} reportResult - Financial report
   */
  printFinancialReport(reportResult) {
    console.log(`\n${colors.bright}${colors.magenta}===================================${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta} FINANCIAL PORTFOLIO REPORT ${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta}===================================${colors.reset}\n`);

    console.log(`${colors.bright}${colors.yellow}PORTFOLIO SUMMARY${colors.reset}`);
    console.log(`Total Value: ${colors.green}$${reportResult.portfolioSummary.totalValue.toLocaleString()}${colors.reset}`);
    console.log(`Asset Count: ${reportResult.portfolioSummary.assetCount}`);

    console.log(`\n${colors.bright}${colors.yellow}TOP HOLDINGS${colors.reset}`);
    reportResult.portfolioSummary.topHoldings.forEach((holding, index) => {
      console.log(`${index + 1}. ${colors.cyan}${holding.name}${colors.reset}: $${holding.value.toLocaleString()} (${holding.percentage.toFixed(2)}%)`);
    });

    console.log(`\n${colors.bright}${colors.yellow}RISK ASSESSMENT${colors.reset}`);

    // Create a colored bar for diversification score
    const score = reportResult.riskAssessment.diversificationScore;
    const scoreColor = score > 70 ? colors.green : score > 40 ? colors.yellow : colors.red;
    const scoreBar = `${scoreColor}${'█'.repeat(Math.floor(score / 5))}${colors.dim}${'█'.repeat(Math.floor((100 - score) / 5))}${colors.reset}`;

    console.log(`Diversification Score: ${scoreColor}${score.toFixed(1)}${colors.reset} / 100`);
    console.log(scoreBar);
    console.log(`Volatility Score: ${reportResult.riskAssessment.volatilityScore.toFixed(1)} / 100`);

    console.log(`\n${colors.bright}${colors.yellow}RECOMMENDED ACTIONS${colors.reset}`);
    reportResult.riskAssessment.recommendedActions.forEach((action, index) => {
      console.log(`${index + 1}. ${action}`);
    });

    console.log(`\n${colors.dim}Report generated: ${reportResult.generatedDate}${colors.reset}`);
  }
}

/**
 * Run the demo
 */
async function runDemo() {
  console.log(`${colors.bright}${colors.magenta}===================================${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta} MCP SERVICES INTEGRATION DEMO ${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}===================================${colors.reset}\n`);

  try {
    // Create the financial document analyzer
    const analyzer = new FinancialDocumentAnalyzer();

    // Create a test directory and PDF
    const testDir = path.join(__dirname, 'test-files');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const testFilePath = path.join(testDir, 'portfolio.pdf');
    if (!fs.existsSync(testFilePath)) {
      // Create a simple test PDF with portfolio data
      console.log(`${colors.yellow}Creating test PDF at: ${testFilePath}${colors.reset}`);

      // Create basic PDF content (in real situations, this would be a real PDF)
      const pdfContent = `%PDF-1.5
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 400 >>
stream
BT
/F1 24 Tf
72 720 Td
(Investment Portfolio Statement) Tj
/F1 12 Tf
0 -36 Td
(Holdings as of May 12, 2025) Tj
0 -24 Td
(Apple Inc. (AAPL) - ISIN: US0378331005 - 100 shares - $18,250.00) Tj
0 -24 Td
(Microsoft Corp. (MSFT) - ISIN: US5949181045 - 50 shares - $15,750.00) Tj
0 -24 Td
(Amazon.com Inc. (AMZN) - ISIN: US0231351067 - 30 shares - $9,300.00) Tj
0 -24 Td
(Alphabet Inc. (GOOGL) - ISIN: US02079K1079 - 20 shares - $5,400.00) Tj
0 -24 Td
(Tesla Inc. (TSLA) - ISIN: US88160R1014 - 25 shares - $4,250.00) Tj
0 -36 Td
(Total Portfolio Value: $52,950.00) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000059 00000 n
0000000118 00000 n
0000000217 00000 n
0000000284 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
735
%%EOF`;

      // Write the test PDF
      fs.writeFileSync(testFilePath, pdfContent);
    }

    // Analyze the document
    console.log(`${colors.bright}${colors.yellow}Analyzing document: ${testFilePath}${colors.reset}\n`);
    const result = await analyzer.analyzeDocument(testFilePath);

    // Print the financial report
    analyzer.printFinancialReport(result.reportResult);

    console.log(`\n${colors.bright}${colors.green}Demo completed successfully!${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}Real-world Integration Patterns:${colors.reset}`);
    console.log(`1. ${colors.yellow}Financial Advisor Applications${colors.reset} - Analyze client portfolios`);
    console.log(`2. ${colors.yellow}Compliance Systems${colors.reset} - Auto-validate financial statements`);
    console.log(`3. ${colors.yellow}Risk Management${colors.reset} - Identify potential risks in portfolios`);
    console.log(`4. ${colors.yellow}Document Management${colors.reset} - Extract and index financial data`);

  } catch (error) {
    console.error(`${colors.red}Error in demo: ${error.message}${colors.reset}`);
    console.error(error);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runDemo().catch(error => {
    console.error(`Unhandled error:`, error);
    process.exit(1);
  });
}

// Export the FinancialDocumentAnalyzer class
module.exports = {
  FinancialDocumentAnalyzer
};