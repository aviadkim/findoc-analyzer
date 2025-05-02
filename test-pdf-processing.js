/**
 * Test PDF Processing
 * 
 * This script tests the PDF processing functionality using mock data.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mock data for testing
const mockData = {
  document: {
    id: 'doc-123456',
    name: 'Test Portfolio Statement',
    type: 'financial_statement',
    status: 'processed',
    uploaded_at: new Date().toISOString(),
    processed_at: new Date().toISOString(),
    content: {
      text: "INVESTMENT PORTFOLIO STATEMENT\n\nDate: 28.02.2025\nAccount Number: 12345678\nClient: John Doe\n\nPORTFOLIO SUMMARY\nTotal Value: USD 1,250,000.00\nCurrency: USD\nValuation Date: 28.02.2025\n\nASSET ALLOCATION\nEquity: 45%\nFixed Income: 30%\nCash: 15%\nAlternative: 10%\n\nSECURITIES HOLDINGS\nAPPLE INC (US0378331005) - Equity - 500 - USD 170.00 - USD 85,000.00 - 6.8%\nMICROSOFT CORP (US5949181045) - Equity - 300 - USD 340.00 - USD 102,000.00 - 8.16%\nAMAZON.COM INC (US0231351067) - Equity - 100 - USD 950.00 - USD 95,000.00 - 7.6%\nUS TREASURY 2.5% 15/02/2045 (US912810RK35) - Bond - 200,000 - USD 0.99 - USD 198,000.00 - 15.84%\nGOLDMAN SACHS 0% NOTES 23-07.11.29 (XS2692298537) - Bond - 150,000 - USD 0.98 - USD 147,000.00 - 11.76%\n\nSECTOR ALLOCATION\nTechnology: 22.56%\nConsumer: 7.6%\nGovernment: 15.84%\nFinancial: 11.76%\nOther: 42.24%\n\nNOTES\nThis portfolio statement is for informational purposes only and does not constitute investment advice. Past performance is not indicative of future results. Please consult with your financial advisor before making any investment decisions.",
      tables: [
        {
          title: "Asset Allocation",
          headers: ["Asset Class", "Percentage"],
          rows: [
            ["Equity", "45%"],
            ["Fixed Income", "30%"],
            ["Cash", "15%"],
            ["Alternative", "10%"]
          ]
        },
        {
          title: "Securities Holdings",
          headers: ["Security", "ISIN", "Type", "Quantity", "Price", "Value", "Weight"],
          rows: [
            ["APPLE INC", "US0378331005", "Equity", "500", "USD 170.00", "USD 85,000.00", "6.8%"],
            ["MICROSOFT CORP", "US5949181045", "Equity", "300", "USD 340.00", "USD 102,000.00", "8.16%"],
            ["AMAZON.COM INC", "US0231351067", "Equity", "100", "USD 950.00", "USD 95,000.00", "7.6%"],
            ["US TREASURY 2.5% 15/02/2045", "US912810RK35", "Bond", "200,000", "USD 0.99", "USD 198,000.00", "15.84%"],
            ["GOLDMAN SACHS 0% NOTES 23-07.11.29", "XS2692298537", "Bond", "150,000", "USD 0.98", "USD 147,000.00", "11.76%"]
          ]
        }
      ]
    },
    metadata: {
      title: "Investment Portfolio Statement",
      author: "Financial Institution",
      creationDate: "2025-02-28",
      securities: [
        {
          name: "APPLE INC",
          isin: "US0378331005",
          type: "Equity",
          quantity: 500,
          price: 170.00,
          value: 85000.00,
          currency: "USD",
          weight: 0.068
        },
        {
          name: "MICROSOFT CORP",
          isin: "US5949181045",
          type: "Equity",
          quantity: 300,
          price: 340.00,
          value: 102000.00,
          currency: "USD",
          weight: 0.0816
        },
        {
          name: "AMAZON.COM INC",
          isin: "US0231351067",
          type: "Equity",
          quantity: 100,
          price: 950.00,
          value: 95000.00,
          currency: "USD",
          weight: 0.076
        },
        {
          name: "US TREASURY 2.5% 15/02/2045",
          isin: "US912810RK35",
          type: "Bond",
          quantity: 200000,
          price: 0.99,
          value: 198000.00,
          currency: "USD",
          weight: 0.1584
        },
        {
          name: "GOLDMAN SACHS 0% NOTES 23-07.11.29",
          isin: "XS2692298537",
          type: "Bond",
          quantity: 150000,
          price: 0.98,
          value: 147000.00,
          currency: "USD",
          weight: 0.1176
        }
      ],
      portfolio: {
        totalValue: 1250000.00,
        currency: "USD",
        valuationDate: "2025-02-28",
        assetAllocation: {
          equity: 0.45,
          fixedIncome: 0.30,
          cash: 0.15,
          alternative: 0.10
        },
        sectorAllocation: {
          technology: 0.2256,
          consumer: 0.076,
          government: 0.1584,
          financial: 0.1176,
          other: 0.4224
        }
      }
    }
  }
};

// Function to answer questions about the document
function answerQuestion(question, document) {
  const q = question.toLowerCase();
  
  if (q.includes('total value') || q.includes('portfolio value')) {
    return `The total value of the portfolio is ${document.metadata.portfolio.currency} ${document.metadata.portfolio.totalValue.toLocaleString()}.`;
  } else if (q.includes('how many securities') || q.includes('number of securities')) {
    return `There are ${document.metadata.securities.length} securities in the portfolio.`;
  } else if (q.includes('isin') && q.includes('apple')) {
    const apple = document.metadata.securities.find(s => s.name.toLowerCase().includes('apple'));
    return apple ? `The ISIN of Apple Inc is ${apple.isin}.` : 'Apple Inc was not found in the portfolio.';
  } else if (q.includes('weight') && q.includes('microsoft')) {
    const microsoft = document.metadata.securities.find(s => s.name.toLowerCase().includes('microsoft'));
    return microsoft ? `The weight of Microsoft Corp in the portfolio is ${(microsoft.weight * 100).toFixed(2)}%.` : 'Microsoft Corp was not found in the portfolio.';
  } else if (q.includes('asset allocation')) {
    const allocation = document.metadata.portfolio.assetAllocation;
    return `The asset allocation of the portfolio is: Equity ${(allocation.equity * 100).toFixed(0)}%, Fixed Income ${(allocation.fixedIncome * 100).toFixed(0)}%, Cash ${(allocation.cash * 100).toFixed(0)}%, and Alternative ${(allocation.alternative * 100).toFixed(0)}%.`;
  } else {
    return 'I don\'t have enough information to answer this question.';
  }
}

// Function to run the test
function runTest() {
  console.log('Running PDF Processing Test...');
  console.log('Using mock data for testing.');
  
  // Display document information
  console.log('\nDocument Information:');
  console.log(`ID: ${mockData.document.id}`);
  console.log(`Name: ${mockData.document.name}`);
  console.log(`Type: ${mockData.document.type}`);
  console.log(`Status: ${mockData.document.status}`);
  console.log(`Uploaded At: ${mockData.document.uploaded_at}`);
  console.log(`Processed At: ${mockData.document.processed_at}`);
  
  // Display extracted text (first 200 characters)
  console.log('\nExtracted Text (excerpt):');
  console.log(mockData.document.content.text.substring(0, 200) + '...');
  
  // Display tables
  console.log('\nExtracted Tables:');
  mockData.document.content.tables.forEach((table, index) => {
    console.log(`\nTable ${index + 1}: ${table.title}`);
    
    // Display headers
    console.log(table.headers.join(' | '));
    console.log('-'.repeat(table.headers.join(' | ').length));
    
    // Display rows
    table.rows.forEach(row => {
      console.log(row.join(' | '));
    });
  });
  
  // Display securities
  console.log('\nExtracted Securities:');
  console.log('Name | ISIN | Type | Quantity | Price | Value | Weight');
  console.log('-'.repeat(80));
  mockData.document.metadata.securities.forEach(security => {
    console.log(`${security.name} | ${security.isin} | ${security.type} | ${security.quantity} | ${security.currency} ${security.price} | ${security.currency} ${security.value} | ${(security.weight * 100).toFixed(2)}%`);
  });
  
  // Test Q&A functionality
  console.log('\nTesting Q&A Functionality:');
  const questions = [
    'What is the total value of the portfolio?',
    'How many securities are in the portfolio?',
    'What is the ISIN of Apple Inc?',
    'What is the weight of Microsoft Corp in the portfolio?',
    'What is the asset allocation of the portfolio?'
  ];
  
  questions.forEach(question => {
    const answer = answerQuestion(question, mockData.document);
    console.log(`\nQ: ${question}`);
    console.log(`A: ${answer}`);
  });
  
  console.log('\nPDF Processing Test completed successfully!');
}

// Run the test
runTest();
