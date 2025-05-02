/**
 * Financial Reasoner Agent
 *
 * This agent validates financial data for consistency and accuracy.
 */

const { generateContentInternal } = require('../../api/controllers/geminiController');
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

/**
 * Financial Reasoner Agent
 */
class FinancialReasonerAgent {
  /**
   * Constructor
   * @param {object} options - Agent options
   */
  constructor(options = {}) {
    this.name = 'Financial Reasoner Agent';
    this.description = 'Validates financial data for consistency and accuracy';
    this.options = options;
    this.state = {
      processing: false,
      completed: false
    };
  }

  /**
   * Process securities
   * @param {object} securitiesResult - Securities extraction result
   * @returns {Promise<object>} Financial reasoning result
   */
  async processSecurities(securitiesResult) {
    try {
      console.log('Financial Reasoner processing securities');

      // Update state
      this.state = {
        processing: true,
        completed: false
      };

      // Validate securities
      const validatedSecurities = await this.validateSecurities(securitiesResult.securities);

      // Calculate portfolio metrics
      const portfolioMetrics = this.calculatePortfolioMetrics(validatedSecurities);

      // Generate insights
      const insights = await this.generateInsights(validatedSecurities, portfolioMetrics);

      // Create result
      const result = {
        securities: validatedSecurities,
        securitiesCount: validatedSecurities.length,
        totalValue: securitiesResult.totalValue,
        currency: securitiesResult.currency,
        portfolioMetrics,
        insights
      };

      // Update state
      this.state = {
        processing: false,
        completed: true
      };

      return result;
    } catch (error) {
      console.error('Error in Financial Reasoner:', error);

      // Update state
      this.state = {
        processing: false,
        completed: false,
        error: error.message
      };

      throw error;
    }
  }

  /**
   * Validate securities
   * @param {Array<object>} securities - Securities to validate
   * @returns {Promise<Array<object>>} Validated securities
   */
  async validateSecurities(securities) {
    try {
      const validatedSecurities = [];

      for (const security of securities) {
        // Validate security
        const validatedSecurity = await this.validateSecurity(security);
        validatedSecurities.push(validatedSecurity);
      }

      return validatedSecurities;
    } catch (error) {
      console.error('Error validating securities:', error);
      throw error;
    }
  }

  /**
   * Validate security
   * @param {object} security - Security to validate
   * @returns {Promise<object>} Validated security
   */
  async validateSecurity(security) {
    try {
      // Check if security has all required fields
      const validatedSecurity = { ...security };

      // Validate ISIN
      if (!validatedSecurity.isin || !this.isValidIsin(validatedSecurity.isin)) {
        validatedSecurity.validationErrors = validatedSecurity.validationErrors || [];
        validatedSecurity.validationErrors.push('Invalid ISIN');
      }

      // Validate quantity
      if (validatedSecurity.quantity === null || isNaN(validatedSecurity.quantity)) {
        validatedSecurity.quantity = null;
      }

      // Validate price
      if (validatedSecurity.price === null || isNaN(validatedSecurity.price)) {
        validatedSecurity.price = null;
      }

      // Validate value
      if (validatedSecurity.value === null || isNaN(validatedSecurity.value)) {
        // Try to calculate value from quantity and price
        if (validatedSecurity.quantity !== null && validatedSecurity.price !== null) {
          validatedSecurity.value = validatedSecurity.quantity * validatedSecurity.price;
        } else {
          validatedSecurity.value = null;
        }
      }

      // Validate currency
      if (!validatedSecurity.currency) {
        validatedSecurity.currency = 'USD'; // Default currency
      }

      // Validate weight
      if (validatedSecurity.weight === null || isNaN(validatedSecurity.weight)) {
        validatedSecurity.weight = null;
      }

      // Add validation status
      validatedSecurity.isValid = !validatedSecurity.validationErrors || validatedSecurity.validationErrors.length === 0;

      return validatedSecurity;
    } catch (error) {
      console.error('Error validating security:', error);
      return {
        ...security,
        isValid: false,
        validationErrors: ['Error validating security: ' + error.message]
      };
    }
  }

  /**
   * Check if ISIN is valid
   * @param {string} isin - ISIN to validate
   * @returns {boolean} Whether ISIN is valid
   */
  isValidIsin(isin) {
    // ISIN format: 2 letters followed by 10 characters (letters or numbers)
    return /^[A-Z]{2}[A-Z0-9]{10}$/.test(isin);
  }

  /**
   * Calculate portfolio metrics
   * @param {Array<object>} securities - Securities
   * @returns {object} Portfolio metrics
   */
  calculatePortfolioMetrics(securities) {
    try {
      // Filter valid securities with value
      const validSecurities = securities.filter(s => s.isValid && s.value !== null);

      // Calculate total value
      const totalValue = validSecurities.reduce((sum, s) => sum + s.value, 0);

      // Calculate diversification score
      const diversificationScore = this.calculateDiversificationScore(validSecurities);

      // Determine risk level
      const riskLevel = this.determineRiskLevel(validSecurities);

      // Calculate sector allocation
      const sectorAllocation = this.calculateSectorAllocation(validSecurities, totalValue);

      // Calculate currency allocation
      const currencyAllocation = this.calculateCurrencyAllocation(validSecurities, totalValue);

      return {
        totalValue,
        securitiesCount: validSecurities.length,
        diversificationScore,
        riskLevel,
        sectorAllocation,
        currencyAllocation
      };
    } catch (error) {
      console.error('Error calculating portfolio metrics:', error);
      return {
        totalValue: 0,
        securitiesCount: 0,
        diversificationScore: 0,
        riskLevel: 'Unknown',
        sectorAllocation: [],
        currencyAllocation: []
      };
    }
  }

  /**
   * Calculate diversification score
   * @param {Array<object>} securities - Securities
   * @returns {number} Diversification score (0-1)
   */
  calculateDiversificationScore(securities) {
    try {
      if (securities.length === 0) {
        return 0;
      }

      // Calculate total value
      const totalValue = securities.reduce((sum, s) => sum + s.value, 0);

      // Calculate Herfindahl-Hirschman Index (HHI)
      const hhi = securities.reduce((sum, s) => {
        const weight = s.value / totalValue;
        return sum + weight * weight;
      }, 0);

      // Convert HHI to diversification score (1 - HHI)
      // Normalize to 0-1 range
      return Math.max(0, Math.min(1, 1 - hhi));
    } catch (error) {
      console.error('Error calculating diversification score:', error);
      return 0;
    }
  }

  /**
   * Determine risk level
   * @param {Array<object>} securities - Securities
   * @returns {string} Risk level
   */
  determineRiskLevel(securities) {
    try {
      // This is a simplified implementation
      // In a real implementation, we would use a more sophisticated approach

      // Calculate diversification score
      const diversificationScore = this.calculateDiversificationScore(securities);

      // Determine risk level based on diversification score
      if (diversificationScore >= 0.8) {
        return 'Low';
      } else if (diversificationScore >= 0.5) {
        return 'Moderate';
      } else if (diversificationScore >= 0.3) {
        return 'High';
      } else {
        return 'Very High';
      }
    } catch (error) {
      console.error('Error determining risk level:', error);
      return 'Unknown';
    }
  }

  /**
   * Calculate sector allocation
   * @param {Array<object>} securities - Securities
   * @param {number} totalValue - Total portfolio value
   * @returns {Array<object>} Sector allocation
   */
  calculateSectorAllocation(securities, totalValue) {
    try {
      // This is a simplified implementation
      // In a real implementation, we would use a more sophisticated approach

      // Group securities by sector
      const sectorMap = new Map();

      for (const security of securities) {
        const sector = security.sector || 'Unknown';

        if (sectorMap.has(sector)) {
          sectorMap.set(sector, sectorMap.get(sector) + security.value);
        } else {
          sectorMap.set(sector, security.value);
        }
      }

      // Convert map to array
      const sectorAllocation = Array.from(sectorMap.entries()).map(([sector, value]) => ({
        sector,
        value,
        percentage: (value / totalValue) * 100
      }));

      // Sort by value in descending order
      sectorAllocation.sort((a, b) => b.value - a.value);

      return sectorAllocation;
    } catch (error) {
      console.error('Error calculating sector allocation:', error);
      return [];
    }
  }

  /**
   * Calculate currency allocation
   * @param {Array<object>} securities - Securities
   * @param {number} totalValue - Total portfolio value
   * @returns {Array<object>} Currency allocation
   */
  calculateCurrencyAllocation(securities, totalValue) {
    try {
      // Group securities by currency
      const currencyMap = new Map();

      for (const security of securities) {
        const currency = security.currency || 'USD';

        if (currencyMap.has(currency)) {
          currencyMap.set(currency, currencyMap.get(currency) + security.value);
        } else {
          currencyMap.set(currency, security.value);
        }
      }

      // Convert map to array
      const currencyAllocation = Array.from(currencyMap.entries()).map(([currency, value]) => ({
        currency,
        value,
        percentage: (value / totalValue) * 100
      }));

      // Sort by value in descending order
      currencyAllocation.sort((a, b) => b.value - a.value);

      return currencyAllocation;
    } catch (error) {
      console.error('Error calculating currency allocation:', error);
      return [];
    }
  }

  /**
   * Generate insights
   * @param {Array<object>} securities - Securities
   * @param {object} portfolioMetrics - Portfolio metrics
   * @returns {Promise<Array<object>>} Insights
   */
  async generateInsights(securities, portfolioMetrics) {
    try {
      // Prepare prompt
      const prompt = `
        Generate insights for a portfolio with the following metrics:
        - Total Value: ${portfolioMetrics.totalValue}
        - Securities Count: ${portfolioMetrics.securitiesCount}
        - Diversification Score: ${portfolioMetrics.diversificationScore}
        - Risk Level: ${portfolioMetrics.riskLevel}

        Securities:
        ${JSON.stringify(securities.map(s => ({
          isin: s.isin,
          name: s.name,
          value: s.value,
          weight: s.weight,
          sector: s.sector,
          currency: s.currency
        })), null, 2)}

        Generate 3-5 insights about this portfolio. Each insight should have:
        - type: The insight type (diversification, risk, allocation, etc.)
        - title: A short title for the insight
        - description: A detailed description of the insight
        - recommendation: A recommendation based on the insight

        Return the insights as a JSON array of objects with type, title, description, and recommendation properties.
      `;

      try {
        // Generate response using Gemini API
        const responseText = await generateContentInternal(prompt);

        // Extract JSON
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
          try {
            const insights = JSON.parse(jsonMatch[0]);
            return insights;
          } catch (error) {
            console.error('Error parsing insights JSON:', error);
            // Continue to fallback
          }
        }
      } catch (error) {
        console.error('Error generating insights with Gemini:', error);
        // Continue to fallback
      }

      return this.fallbackInsights(portfolioMetrics);
    } catch (error) {
      console.error('Error generating insights:', error);
      return this.fallbackInsights(portfolioMetrics);
    }
  }

  /**
   * Fallback insights
   * @param {object} portfolioMetrics - Portfolio metrics
   * @returns {Array<object>} Fallback insights
   */
  fallbackInsights(portfolioMetrics) {
    return [
      {
        type: 'diversification',
        title: 'Portfolio Diversification',
        description: `Your portfolio has a diversification score of ${portfolioMetrics.diversificationScore.toFixed(2)} out of 1.0.`,
        recommendation: 'Consider diversifying your portfolio across more securities to reduce risk.'
      },
      {
        type: 'risk',
        title: 'Risk Level',
        description: `Your portfolio has a ${portfolioMetrics.riskLevel} risk level.`,
        recommendation: 'Review your risk tolerance and adjust your portfolio accordingly.'
      }
    ];
  }

  /**
   * Query document
   * @param {object} documentResult - Document processing result
   * @param {string} query - Query string
   * @returns {Promise<object>} Query result
   */
  async queryDocument(documentResult, query) {
    try {
      console.log(`Querying document with query: ${query}`);

      // Prepare prompt
      const prompt = `
        Answer the following question about a financial document:

        Document Information:
        - Document Type: ${documentResult.documentType}
        - Total Value: ${documentResult.totalValue} ${documentResult.currency}
        - Securities Count: ${documentResult.securitiesCount}
        - Risk Level: ${documentResult.portfolioMetrics?.riskLevel || 'Unknown'}

        Securities:
        ${JSON.stringify(documentResult.securities?.slice(0, 10).map(s => ({
          isin: s.isin,
          name: s.name,
          quantity: s.quantity,
          price: s.price,
          value: s.value,
          weight: s.weight,
          currency: s.currency
        })), null, 2)}

        ${documentResult.securities?.length > 10 ? `... and ${documentResult.securities.length - 10} more securities` : ''}

        Question: ${query}

        Provide a detailed answer based on the document information. If the information is not available in the document, say so.
      `;

      try {
        // Generate response using Gemini API
        const answer = await generateContentInternal(prompt);

        return {
          query,
          answer,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error querying document with Gemini:', error);
        // Fallback to simple response
        return {
          query,
          answer: 'I cannot answer this question at the moment. Please try again later.',
          timestamp: new Date().toISOString(),
          error: true
        };
      }
    } catch (error) {
      console.error('Error querying document:', error);
      return {
        query,
        answer: 'Error querying document: ' + error.message,
        timestamp: new Date().toISOString(),
        error: true
      };
    }
  }

  /**
   * Generate report
   * @param {object} documentResult - Document processing result
   * @param {object} options - Report options
   * @returns {Promise<object>} Report generation result
   */
  async generateReport(documentResult, options = {}) {
    try {
      console.log('Generating report');

      // Create report content
      const reportContent = await this.createReportContent(documentResult, options);

      // Generate PDF report
      const reportPath = await this.generatePdfReport(reportContent, options);

      return {
        reportPath,
        reportContent,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Create report content
   * @param {object} documentResult - Document processing result
   * @param {object} options - Report options
   * @returns {Promise<object>} Report content
   */
  async createReportContent(documentResult, options = {}) {
    try {
      // Prepare prompt
      const prompt = `
        Generate a financial report for the following portfolio:

        Document Information:
        - Document Type: ${documentResult.documentType}
        - Total Value: ${documentResult.totalValue} ${documentResult.currency}
        - Securities Count: ${documentResult.securitiesCount}
        - Risk Level: ${documentResult.portfolioMetrics?.riskLevel || 'Unknown'}

        Securities:
        ${JSON.stringify(documentResult.securities?.slice(0, 10).map(s => ({
          isin: s.isin,
          name: s.name,
          quantity: s.quantity,
          price: s.price,
          value: s.value,
          weight: s.weight,
          currency: s.currency
        })), null, 2)}

        ${documentResult.securities?.length > 10 ? `... and ${documentResult.securities.length - 10} more securities` : ''}

        Insights:
        ${JSON.stringify(documentResult.insights, null, 2)}

        Generate a comprehensive financial report with the following sections:
        1. Executive Summary
        2. Portfolio Overview
        3. Asset Allocation
        4. Top Holdings
        5. Risk Analysis
        6. Recommendations

        Return the report as a JSON object with the following structure:
        {
          "title": "Financial Report",
          "date": "2023-04-20",
          "sections": [
            {
              "title": "Executive Summary",
              "content": "..."
            },
            ...
          ]
        }
      `;

      try {
        // Generate response using Gemini API
        const responseText = await generateContentInternal(prompt);

        // Extract JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          try {
            const reportContent = JSON.parse(jsonMatch[0]);
            return reportContent;
          } catch (error) {
            console.error('Error parsing report content JSON:', error);
            // Continue to fallback
          }
        }
      } catch (error) {
        console.error('Error creating report content with Gemini:', error);
        // Continue to fallback
      }

      return this.fallbackReportContent(documentResult);
    } catch (error) {
      console.error('Error creating report content:', error);
      return this.fallbackReportContent(documentResult);
    }
  }

  /**
   * Fallback report content
   * @param {object} documentResult - Document processing result
   * @returns {object} Fallback report content
   */
  fallbackReportContent(documentResult) {
    return {
      title: 'Financial Report',
      date: new Date().toISOString().split('T')[0],
      sections: [
        {
          title: 'Executive Summary',
          content: `This report provides an analysis of your portfolio with a total value of ${documentResult.totalValue} ${documentResult.currency}.`
        },
        {
          title: 'Portfolio Overview',
          content: `Your portfolio consists of ${documentResult.securitiesCount} securities with a total value of ${documentResult.totalValue} ${documentResult.currency}.`
        },
        {
          title: 'Asset Allocation',
          content: 'Asset allocation information is not available.'
        },
        {
          title: 'Top Holdings',
          content: 'Top holdings information is not available.'
        },
        {
          title: 'Risk Analysis',
          content: `Your portfolio has a ${documentResult.portfolioMetrics?.riskLevel || 'Unknown'} risk level with a diversification score of ${documentResult.portfolioMetrics?.diversificationScore?.toFixed(2) || 'Unknown'}.`
        },
        {
          title: 'Recommendations',
          content: 'Recommendations are not available.'
        }
      ]
    };
  }

  /**
   * Generate PDF report
   * @param {object} reportContent - Report content
   * @param {object} options - Report options
   * @returns {Promise<string>} Report file path
   */
  async generatePdfReport(reportContent, options = {}) {
    try {
      // Create PDF document
      const pdfDoc = await PDFDocument.create();

      // Add font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Add page
      const page = pdfDoc.addPage([612, 792]); // Letter size

      // Set font size
      const fontSize = 12;
      const titleFontSize = 24;
      const sectionTitleFontSize = 18;

      // Set margins
      const margin = 50;

      // Set initial position
      let y = page.getHeight() - margin;

      // Add title
      page.drawText(reportContent.title, {
        x: margin,
        y,
        size: titleFontSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      y -= titleFontSize + 10;

      // Add date
      page.drawText(`Date: ${reportContent.date}`, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0)
      });

      y -= fontSize + 20;

      // Add sections
      for (const section of reportContent.sections) {
        // Check if we need a new page
        if (y < margin + 100) {
          // Add new page
          const newPage = pdfDoc.addPage([612, 792]);
          page = newPage;
          y = page.getHeight() - margin;
        }

        // Add section title
        page.drawText(section.title, {
          x: margin,
          y,
          size: sectionTitleFontSize,
          font: boldFont,
          color: rgb(0, 0, 0)
        });

        y -= sectionTitleFontSize + 10;

        // Add section content
        const contentLines = this.wrapText(section.content, font, fontSize, page.getWidth() - 2 * margin);

        for (const line of contentLines) {
          // Check if we need a new page
          if (y < margin + 20) {
            // Add new page
            const newPage = pdfDoc.addPage([612, 792]);
            page = newPage;
            y = page.getHeight() - margin;
          }

          // Add line
          page.drawText(line, {
            x: margin,
            y,
            size: fontSize,
            font,
            color: rgb(0, 0, 0)
          });

          y -= fontSize + 5;
        }

        y -= 20;
      }

      // Save PDF
      const pdfBytes = await pdfDoc.save();

      // Create directory if it doesn't exist
      const reportsDir = options.reportsDir || process.env.REPORTS_FOLDER || '/tmp/reports';

      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Save PDF to file
      const reportPath = path.join(reportsDir, `report_${Date.now()}.pdf`);
      fs.writeFileSync(reportPath, pdfBytes);

      return reportPath;
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }

  /**
   * Wrap text to fit within a width
   * @param {string} text - Text to wrap
   * @param {object} font - PDF font
   * @param {number} fontSize - Font size
   * @param {number} maxWidth - Maximum width
   * @returns {Array<string>} Wrapped text lines
   */
  wrapText(text, font, fontSize, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Get agent status
   * @returns {Promise<object>} Agent status
   */
  async getStatus() {
    return {
      name: this.name,
      description: this.description,
      state: this.state,
      apiKeyConfigured: true // We're using the geminiController which handles API key management
    };
  }
}

module.exports = {
  FinancialReasonerAgent
};
