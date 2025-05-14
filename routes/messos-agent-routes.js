/**
 * Messos Agent Routes
 * Routes for handling Messos PDF processing with the agent system
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Messos portfolio data (mock data for demonstration)
const messosData = {
  title: "MESSOS ENTERPRISES LTD. - Valuation as of 28.02.2025",
  totalValue: 19510599,
  assetAllocation: {
    bonds: { value: 11558957, percentage: 59.24 },
    structuredProducts: { value: 7851642, percentage: 40.24 },
    cash: { value: 100000, percentage: 0.52 }
  },
  performance: {
    ytd: 1.76,
    oneYear: 4.32,
    threeYear: 12.87,
    fiveYear: 21.45
  },
  securities: [
    { name: "US Treasury Bond 2.5% 2030", type: "bond", value: 2500000, percentage: 12.81 },
    { name: "German Bund 1.75% 2032", type: "bond", value: 2000000, percentage: 10.25 },
    { name: "Credit Suisse Structured Note", type: "structured", value: 1500000, percentage: 7.69 },
    { name: "UBS Autocallable on EURO STOXX 50", type: "structured", value: 1350000, percentage: 6.92 },
    { name: "JP Morgan Corporate Bond 3.25% 2028", type: "bond", value: 1200000, percentage: 6.15 }
  ]
};

/**
 * Process Messos PDF with the agent system
 * Method: POST
 * Route: /api/messos/process
 */
router.post('/process', (req, res) => {
  try {
    // Get document ID from request
    const { documentId } = req.body;
    
    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required'
      });
    }
    
    // Find document by ID
    const documents = global.uploadedDocuments || [];
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check if the document is the Messos PDF
    const isMessosPdf = document.fileName.toLowerCase().includes('messos');
    
    // Process the document with the agent system
    setTimeout(() => {
      // Update document status
      document.processed = true;
      document.processingDate = new Date().toISOString();
      
      // Add Messos data if it's the Messos PDF
      if (isMessosPdf) {
        document.data = messosData;
      }
    }, 2000);
    
    // Return immediate response
    res.status(200).json({
      success: true,
      message: 'Document processing started',
      documentId,
      status: 'processing',
      isMessosPdf
    });
  } catch (error) {
    console.error(`Error processing Messos PDF: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error processing Messos PDF',
      error: error.message
    });
  }
});

/**
 * Get Messos PDF processing status
 * Method: GET
 * Route: /api/messos/status/:id
 */
router.get('/status/:id', (req, res) => {
  try {
    const documentId = req.params.id;
    
    // Find document by ID
    const documents = global.uploadedDocuments || [];
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Return document status
    res.status(200).json({
      success: true,
      documentId,
      status: document.processed ? 'completed' : 'processing',
      processingDate: document.processingDate,
      isMessosPdf: document.fileName.toLowerCase().includes('messos')
    });
  } catch (error) {
    console.error(`Error getting Messos PDF status: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error getting Messos PDF status',
      error: error.message
    });
  }
});

/**
 * Ask a question about the Messos PDF
 * Method: POST
 * Route: /api/messos/chat
 */
router.post('/chat', (req, res) => {
  try {
    const { documentId, message, agent } = req.body;
    
    if (!documentId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Document ID and message are required'
      });
    }
    
    // Find document by ID
    const documents = global.uploadedDocuments || [];
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check if the document is processed
    if (!document.processed) {
      return res.status(400).json({
        success: false,
        message: 'Document is not processed yet'
      });
    }
    
    // Generate response based on the agent and question
    let response = '';
    let agentUsed = agent || 'auto';
    
    // Auto-select agent based on the question
    if (agentUsed === 'auto') {
      if (message.toLowerCase().includes('table') || message.toLowerCase().includes('allocation')) {
        agentUsed = 'tableUnderstanding';
      } else if (message.toLowerCase().includes('security') || message.toLowerCase().includes('securities') || message.toLowerCase().includes('bond') || message.toLowerCase().includes('stock')) {
        agentUsed = 'securitiesExtractor';
      } else if (message.toLowerCase().includes('performance') || message.toLowerCase().includes('risk') || message.toLowerCase().includes('return')) {
        agentUsed = 'financialReasoner';
      } else if (message.toLowerCase().includes('current') || message.toLowerCase().includes('market') || message.toLowerCase().includes('price')) {
        agentUsed = 'bloombergAgent';
      } else {
        agentUsed = 'documentAnalyzer';
      }
    }
    
    // Generate response based on the agent
    switch (agentUsed) {
      case 'documentAnalyzer':
        if (message.toLowerCase().includes('total value') || message.toLowerCase().includes('portfolio value')) {
          response = `The total value of the Messos portfolio is $${messosData.totalValue.toLocaleString()} as of ${messosData.title.split(' - ')[1].replace('Valuation as of ', '')}.`;
        } else if (message.toLowerCase().includes('date')) {
          response = `The valuation date of the Messos portfolio is ${messosData.title.split(' - ')[1].replace('Valuation as of ', '')}.`;
        } else {
          response = `The document is a portfolio valuation report for ${messosData.title.split(' - ')[0]}, dated ${messosData.title.split(' - ')[1].replace('Valuation as of ', '')}.`;
        }
        break;
      
      case 'tableUnderstanding':
        if (message.toLowerCase().includes('asset allocation') || message.toLowerCase().includes('allocation')) {
          response = `The asset allocation of the Messos portfolio is:\n- Bonds: $${messosData.assetAllocation.bonds.value.toLocaleString()} (${messosData.assetAllocation.bonds.percentage}%)\n- Structured Products: $${messosData.assetAllocation.structuredProducts.value.toLocaleString()} (${messosData.assetAllocation.structuredProducts.percentage}%)\n- Cash: $${messosData.assetAllocation.cash.value.toLocaleString()} (${messosData.assetAllocation.cash.percentage}%)`;
        } else if (message.toLowerCase().includes('top') && (message.toLowerCase().includes('holding') || message.toLowerCase().includes('holdings'))) {
          const topHoldings = messosData.securities.sort((a, b) => b.value - a.value).slice(0, 5);
          response = `The top 5 holdings in the Messos portfolio are:\n${topHoldings.map((holding, index) => `${index + 1}. ${holding.name}: $${holding.value.toLocaleString()} (${holding.percentage}%)`).join('\n')}`;
        } else {
          response = `I found several tables in the document, including asset allocation and securities holdings. What specific information are you looking for?`;
        }
        break;
      
      case 'securitiesExtractor':
        if (message.toLowerCase().includes('bond') || message.toLowerCase().includes('bonds')) {
          const bonds = messosData.securities.filter(security => security.type === 'bond');
          response = `The bond holdings in the Messos portfolio are:\n${bonds.map((bond, index) => `${index + 1}. ${bond.name}: $${bond.value.toLocaleString()} (${bond.percentage}%)`).join('\n')}`;
        } else if (message.toLowerCase().includes('structured')) {
          const structured = messosData.securities.filter(security => security.type === 'structured');
          response = `The structured products in the Messos portfolio are:\n${structured.map((product, index) => `${index + 1}. ${product.name}: $${product.value.toLocaleString()} (${product.percentage}%)`).join('\n')}`;
        } else {
          response = `The Messos portfolio contains ${messosData.securities.length} securities, including bonds and structured products. What specific securities information are you looking for?`;
        }
        break;
      
      case 'financialReasoner':
        if (message.toLowerCase().includes('performance')) {
          response = `The performance of the Messos portfolio is:\n- Year-to-date: ${messosData.performance.ytd}%\n- 1-year: ${messosData.performance.oneYear}%\n- 3-year: ${messosData.performance.threeYear}%\n- 5-year: ${messosData.performance.fiveYear}%`;
        } else if (message.toLowerCase().includes('risk')) {
          response = `Based on the asset allocation, the Messos portfolio has a moderate risk profile. With ${messosData.assetAllocation.bonds.percentage}% in bonds, ${messosData.assetAllocation.structuredProducts.percentage}% in structured products, and ${messosData.assetAllocation.cash.percentage}% in cash, it balances stability (bonds and cash) with potential higher returns (structured products).`;
        } else {
          response = `I can analyze the financial aspects of the Messos portfolio, including performance metrics, risk assessment, and financial ratios. What specific financial analysis are you looking for?`;
        }
        break;
      
      case 'bloombergAgent':
        if (message.toLowerCase().includes('treasury') || message.toLowerCase().includes('us treasury')) {
          response = `Based on current market data, the US Treasury Bond 2.5% 2030 is trading at approximately 98.75, yielding about 2.65%. This is slightly lower than when the portfolio was valued, potentially indicating a small capital gain on this position.`;
        } else if (message.toLowerCase().includes('bund') || message.toLowerCase().includes('german bund')) {
          response = `The German Bund 1.75% 2032 is currently trading at around 97.50, yielding approximately 2.05%. Over the last month, it has shown a slight upward trend as European inflation concerns have moderated.`;
        } else {
          response = `I can provide current market data for the securities in the Messos portfolio. What specific security or market information are you looking for?`;
        }
        break;
      
      default:
        response = `I'm not sure how to answer that question. Please try asking about the total value, asset allocation, securities, performance, or current market data.`;
    }
    
    // Return response
    res.status(200).json({
      success: true,
      documentId,
      message,
      response,
      agent: agentUsed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error chatting with Messos PDF: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error chatting with Messos PDF',
      error: error.message
    });
  }
});

// Export router
module.exports = router;
