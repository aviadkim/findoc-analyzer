/**
 * Gemini Agent for FinDoc Analyzer
 * 
 * This module provides integration with Google's Gemini API for AI-powered
 * document analysis, question answering, and financial reasoning.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Default model configuration
const DEFAULT_MODEL = 'gemini-1.5-pro';
const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_TOP_P = 0.95;
const DEFAULT_TOP_K = 40;
const DEFAULT_MAX_OUTPUT_TOKENS = 2048;

/**
 * Gemini Agent class
 */
class GeminiAgent {
  /**
   * Create a new Gemini Agent
   * @param {string} apiKey - Gemini API key
   * @param {Object} options - Agent options
   */
  constructor(apiKey, options = {}) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    this.apiKey = apiKey;
    this.model = options.model || DEFAULT_MODEL;
    this.temperature = options.temperature || DEFAULT_TEMPERATURE;
    this.topP = options.topP || DEFAULT_TOP_P;
    this.topK = options.topK || DEFAULT_TOP_K;
    this.maxOutputTokens = options.maxOutputTokens || DEFAULT_MAX_OUTPUT_TOKENS;
    
    // Initialize Gemini API
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.modelInstance = this.genAI.getGenerativeModel({
      model: this.model,
      generationConfig: {
        temperature: this.temperature,
        topP: this.topP,
        topK: this.topK,
        maxOutputTokens: this.maxOutputTokens
      }
    });
    
    // Initialize conversation history
    this.conversationHistory = [];
  }
  
  /**
   * Generate a response from the Gemini model
   * @param {string} prompt - The prompt to send to the model
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - The generated response
   */
  async generateResponse(prompt, options = {}) {
    try {
      const generationConfig = {
        temperature: options.temperature || this.temperature,
        topP: options.topP || this.topP,
        topK: options.topK || this.topK,
        maxOutputTokens: options.maxOutputTokens || this.maxOutputTokens
      };
      
      const result = await this.modelInstance.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig
      });
      
      const response = result.response;
      const text = response.text();
      
      return {
        text,
        response
      };
    } catch (error) {
      console.error('Error generating response from Gemini:', error);
      throw error;
    }
  }
  
  /**
   * Start a new conversation with the Gemini model
   * @param {string} systemPrompt - The system prompt to start the conversation
   * @returns {Promise<Object>} - The conversation object
   */
  async startConversation(systemPrompt) {
    try {
      const chat = this.modelInstance.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          }
        ]
      });
      
      this.conversationHistory = [
        { role: 'user', content: systemPrompt }
      ];
      
      return {
        id: uuidv4(),
        chat,
        history: this.conversationHistory
      };
    } catch (error) {
      console.error('Error starting conversation with Gemini:', error);
      throw error;
    }
  }
  
  /**
   * Send a message to an existing conversation
   * @param {Object} conversation - The conversation object
   * @param {string} message - The message to send
   * @returns {Promise<Object>} - The response
   */
  async sendMessage(conversation, message) {
    try {
      const result = await conversation.chat.sendMessage(message);
      const text = result.response.text();
      
      // Update conversation history
      conversation.history.push(
        { role: 'user', content: message },
        { role: 'assistant', content: text }
      );
      
      return {
        text,
        response: result.response
      };
    } catch (error) {
      console.error('Error sending message to Gemini conversation:', error);
      throw error;
    }
  }
  
  /**
   * Answer a question about a document
   * @param {Object} document - The document object
   * @param {string} question - The question to answer
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The answer
   */
  async answerDocumentQuestion(document, question, options = {}) {
    try {
      // Prepare document context
      let documentContext = `Document Title: ${document.name || 'Untitled'}\n`;
      documentContext += `Document Type: ${document.documentType || 'Unknown'}\n\n`;
      
      // Add document text (truncate if too long)
      const maxTextLength = 15000; // Limit text to avoid token limits
      if (document.content && document.content.text) {
        const text = document.content.text.substring(0, maxTextLength);
        documentContext += `Document Content:\n${text}\n\n`;
        
        if (document.content.text.length > maxTextLength) {
          documentContext += `[Note: Document content truncated due to length]\n\n`;
        }
      }
      
      // Add tables if available
      if (document.content && document.content.tables && document.content.tables.length > 0) {
        documentContext += `Tables in Document:\n`;
        
        for (let i = 0; i < Math.min(5, document.content.tables.length); i++) {
          const table = document.content.tables[i];
          documentContext += `Table ${i + 1}: ${table.name || 'Unnamed Table'}\n`;
          
          // Add headers
          documentContext += table.headers.join(' | ') + '\n';
          documentContext += table.headers.map(() => '---').join(' | ') + '\n';
          
          // Add rows (limit to 20 rows per table)
          for (let j = 0; j < Math.min(20, table.rows.length); j++) {
            documentContext += table.rows[j].join(' | ') + '\n';
          }
          
          if (table.rows.length > 20) {
            documentContext += `[Note: Table truncated, showing 20/${table.rows.length} rows]\n`;
          }
          
          documentContext += '\n';
        }
        
        if (document.content.tables.length > 5) {
          documentContext += `[Note: Showing 5/${document.content.tables.length} tables]\n\n`;
        }
      }
      
      // Add securities if available
      if (document.content && document.content.securities && document.content.securities.length > 0) {
        documentContext += `Securities in Document:\n`;
        
        for (const security of document.content.securities) {
          documentContext += `- ${security.name} (ISIN: ${security.isin})`;
          
          if (security.quantity !== null) {
            documentContext += `, Quantity: ${security.quantity}`;
          }
          
          if (security.price !== null) {
            if (typeof security.price === 'object') {
              documentContext += `, Price: ${security.price.currency}${security.price.value}`;
            } else {
              documentContext += `, Price: ${security.price}`;
            }
          }
          
          documentContext += '\n';
        }
        
        documentContext += '\n';
      }
      
      // Prepare prompt
      const prompt = `
You are a financial document analysis assistant. You have been provided with the following document:

${documentContext}

Please answer the following question about the document:
${question}

Provide a clear, concise, and accurate answer based only on the information in the document. If the document does not contain information to answer the question, state that clearly.
`;
      
      // Generate response
      const response = await this.generateResponse(prompt, options);
      
      return {
        question,
        answer: response.text,
        documentId: document.id,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error answering document question:', error);
      throw error;
    }
  }
  
  /**
   * Generate a table from a document based on a prompt
   * @param {Object} document - The document object
   * @param {string} prompt - The prompt for table generation
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The generated table
   */
  async generateTable(document, prompt, options = {}) {
    try {
      // Prepare document context (similar to answerDocumentQuestion)
      let documentContext = `Document Title: ${document.name || 'Untitled'}\n`;
      documentContext += `Document Type: ${document.documentType || 'Unknown'}\n\n`;
      
      // Add document text (truncate if too long)
      const maxTextLength = 10000; // Limit text to avoid token limits
      if (document.content && document.content.text) {
        const text = document.content.text.substring(0, maxTextLength);
        documentContext += `Document Content:\n${text}\n\n`;
        
        if (document.content.text.length > maxTextLength) {
          documentContext += `[Note: Document content truncated due to length]\n\n`;
        }
      }
      
      // Add tables if available
      if (document.content && document.content.tables && document.content.tables.length > 0) {
        documentContext += `Tables in Document:\n`;
        
        for (let i = 0; i < Math.min(5, document.content.tables.length); i++) {
          const table = document.content.tables[i];
          documentContext += `Table ${i + 1}: ${table.name || 'Unnamed Table'}\n`;
          
          // Add headers
          documentContext += table.headers.join(' | ') + '\n';
          documentContext += table.headers.map(() => '---').join(' | ') + '\n';
          
          // Add rows (limit to 20 rows per table)
          for (let j = 0; j < Math.min(20, table.rows.length); j++) {
            documentContext += table.rows[j].join(' | ') + '\n';
          }
          
          if (table.rows.length > 20) {
            documentContext += `[Note: Table truncated, showing 20/${table.rows.length} rows]\n`;
          }
          
          documentContext += '\n';
        }
        
        if (document.content.tables.length > 5) {
          documentContext += `[Note: Showing 5/${document.content.tables.length} tables]\n\n`;
        }
      }
      
      // Prepare prompt
      const tablePrompt = `
You are a financial document analysis assistant. You have been provided with the following document:

${documentContext}

Please generate a table based on the following request:
${prompt}

Your response should be a valid markdown table with headers and rows. Make sure to include all relevant information from the document.
The table should start with a header row, followed by a separator row with dashes, and then the data rows.
For example:
| Header 1 | Header 2 | Header 3 |
| --- | --- | --- |
| Data 1 | Data 2 | Data 3 |
| Data 4 | Data 5 | Data 6 |

Only return the markdown table, nothing else.
`;
      
      // Generate response
      const response = await this.generateResponse(tablePrompt, options);
      
      // Parse the markdown table
      const tableText = response.text.trim();
      const tableLines = tableText.split('\n');
      
      if (tableLines.length < 3) {
        throw new Error('Generated table is invalid');
      }
      
      // Extract headers
      const headerLine = tableLines[0].trim();
      const headers = headerLine
        .replace(/^\||\|$/g, '') // Remove leading/trailing |
        .split('|')
        .map(header => header.trim());
      
      // Skip separator line
      
      // Extract rows
      const rows = [];
      for (let i = 2; i < tableLines.length; i++) {
        const rowLine = tableLines[i].trim();
        if (rowLine.startsWith('|')) {
          const rowData = rowLine
            .replace(/^\||\|$/g, '') // Remove leading/trailing |
            .split('|')
            .map(cell => cell.trim());
          
          rows.push(rowData);
        }
      }
      
      return {
        id: uuidv4(),
        name: `Generated Table: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
        prompt,
        headers,
        rows,
        markdownTable: tableText,
        documentId: document.id,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating table:', error);
      throw error;
    }
  }
  
  /**
   * Generate a chart description from a document based on a prompt
   * @param {Object} document - The document object
   * @param {string} prompt - The prompt for chart generation
   * @param {string} chartType - The type of chart to generate
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The generated chart description
   */
  async generateChartDescription(document, prompt, chartType, options = {}) {
    try {
      // Prepare document context (similar to previous methods)
      let documentContext = `Document Title: ${document.name || 'Untitled'}\n`;
      documentContext += `Document Type: ${document.documentType || 'Unknown'}\n\n`;
      
      // Add tables if available (focus on tables for chart generation)
      if (document.content && document.content.tables && document.content.tables.length > 0) {
        documentContext += `Tables in Document:\n`;
        
        for (let i = 0; i < Math.min(5, document.content.tables.length); i++) {
          const table = document.content.tables[i];
          documentContext += `Table ${i + 1}: ${table.name || 'Unnamed Table'}\n`;
          
          // Add headers
          documentContext += table.headers.join(' | ') + '\n';
          documentContext += table.headers.map(() => '---').join(' | ') + '\n';
          
          // Add rows (limit to 20 rows per table)
          for (let j = 0; j < Math.min(20, table.rows.length); j++) {
            documentContext += table.rows[j].join(' | ') + '\n';
          }
          
          if (table.rows.length > 20) {
            documentContext += `[Note: Table truncated, showing 20/${table.rows.length} rows]\n`;
          }
          
          documentContext += '\n';
        }
        
        if (document.content.tables.length > 5) {
          documentContext += `[Note: Showing 5/${document.content.tables.length} tables]\n\n`;
        }
      }
      
      // Add securities if available
      if (document.content && document.content.securities && document.content.securities.length > 0) {
        documentContext += `Securities in Document:\n`;
        
        for (const security of document.content.securities) {
          documentContext += `- ${security.name} (ISIN: ${security.isin})`;
          
          if (security.quantity !== null) {
            documentContext += `, Quantity: ${security.quantity}`;
          }
          
          if (security.price !== null) {
            if (typeof security.price === 'object') {
              documentContext += `, Price: ${security.price.currency}${security.price.value}`;
            } else {
              documentContext += `, Price: ${security.price}`;
            }
          }
          
          documentContext += '\n';
        }
        
        documentContext += '\n';
      }
      
      // Prepare prompt
      const chartPrompt = `
You are a financial data visualization expert. You have been provided with the following document:

${documentContext}

Please generate a description for a ${chartType} chart based on the following request:
${prompt}

Your response should be in JSON format with the following structure:
{
  "title": "Chart title",
  "type": "${chartType}",
  "xAxis": {
    "title": "X-axis title",
    "categories": ["Category 1", "Category 2", ...]
  },
  "yAxis": {
    "title": "Y-axis title"
  },
  "series": [
    {
      "name": "Series 1 name",
      "data": [value1, value2, ...]
    },
    {
      "name": "Series 2 name",
      "data": [value1, value2, ...]
    },
    ...
  ],
  "description": "Brief description of what the chart shows"
}

Make sure to include all relevant data from the document. The data should be numeric values suitable for a ${chartType} chart.
Only return the JSON object, nothing else.
`;
      
      // Generate response
      const response = await this.generateResponse(chartPrompt, options);
      
      // Parse the JSON response
      const jsonText = response.text.trim();
      let chartData;
      
      try {
        // Try to parse the JSON
        chartData = JSON.parse(jsonText);
      } catch (error) {
        console.error('Error parsing chart JSON:', error);
        
        // Try to extract JSON from the response
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            chartData = JSON.parse(jsonMatch[0]);
          } catch (innerError) {
            throw new Error('Could not parse chart data from response');
          }
        } else {
          throw new Error('Could not extract chart data from response');
        }
      }
      
      return {
        id: uuidv4(),
        name: chartData.title || `Generated ${chartType} Chart`,
        prompt,
        chartType,
        chartData,
        documentId: document.id,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating chart description:', error);
      throw error;
    }
  }
  
  /**
   * Extract key insights from a document
   * @param {Object} document - The document object
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The extracted insights
   */
  async extractInsights(document, options = {}) {
    try {
      // Prepare document context
      let documentContext = `Document Title: ${document.name || 'Untitled'}\n`;
      documentContext += `Document Type: ${document.documentType || 'Unknown'}\n\n`;
      
      // Add document text (truncate if too long)
      const maxTextLength = 15000; // Limit text to avoid token limits
      if (document.content && document.content.text) {
        const text = document.content.text.substring(0, maxTextLength);
        documentContext += `Document Content:\n${text}\n\n`;
        
        if (document.content.text.length > maxTextLength) {
          documentContext += `[Note: Document content truncated due to length]\n\n`;
        }
      }
      
      // Add tables if available
      if (document.content && document.content.tables && document.content.tables.length > 0) {
        documentContext += `Tables in Document:\n`;
        
        for (let i = 0; i < Math.min(5, document.content.tables.length); i++) {
          const table = document.content.tables[i];
          documentContext += `Table ${i + 1}: ${table.name || 'Unnamed Table'}\n`;
          
          // Add headers
          documentContext += table.headers.join(' | ') + '\n';
          documentContext += table.headers.map(() => '---').join(' | ') + '\n';
          
          // Add rows (limit to 20 rows per table)
          for (let j = 0; j < Math.min(20, table.rows.length); j++) {
            documentContext += table.rows[j].join(' | ') + '\n';
          }
          
          if (table.rows.length > 20) {
            documentContext += `[Note: Table truncated, showing 20/${table.rows.length} rows]\n`;
          }
          
          documentContext += '\n';
        }
        
        if (document.content.tables.length > 5) {
          documentContext += `[Note: Showing 5/${document.content.tables.length} tables]\n\n`;
        }
      }
      
      // Add securities if available
      if (document.content && document.content.securities && document.content.securities.length > 0) {
        documentContext += `Securities in Document:\n`;
        
        for (const security of document.content.securities) {
          documentContext += `- ${security.name} (ISIN: ${security.isin})`;
          
          if (security.quantity !== null) {
            documentContext += `, Quantity: ${security.quantity}`;
          }
          
          if (security.price !== null) {
            if (typeof security.price === 'object') {
              documentContext += `, Price: ${security.price.currency}${security.price.value}`;
            } else {
              documentContext += `, Price: ${security.price}`;
            }
          }
          
          documentContext += '\n';
        }
        
        documentContext += '\n';
      }
      
      // Prepare prompt
      const insightsPrompt = `
You are a financial document analysis expert. You have been provided with the following document:

${documentContext}

Please extract key insights from this document. Focus on:
1. Main financial metrics and their values
2. Key trends or changes
3. Important securities or holdings
4. Significant risks or opportunities
5. Any notable financial events or transactions

Your response should be in JSON format with the following structure:
{
  "summary": "Brief summary of the document",
  "keyMetrics": [
    {"name": "Metric name", "value": "Metric value", "description": "Brief description"}
  ],
  "trends": [
    {"name": "Trend name", "description": "Description of the trend"}
  ],
  "topHoldings": [
    {"name": "Security name", "value": "Value or percentage", "notes": "Any relevant notes"}
  ],
  "risks": [
    {"name": "Risk name", "description": "Description of the risk"}
  ],
  "opportunities": [
    {"name": "Opportunity name", "description": "Description of the opportunity"}
  ],
  "keyEvents": [
    {"name": "Event name", "date": "Event date if available", "description": "Description of the event"}
  ]
}

Only include sections where you can find relevant information in the document. If some sections have no relevant information, include an empty array for that section.
Only return the JSON object, nothing else.
`;
      
      // Generate response
      const response = await this.generateResponse(insightsPrompt, options);
      
      // Parse the JSON response
      const jsonText = response.text.trim();
      let insights;
      
      try {
        // Try to parse the JSON
        insights = JSON.parse(jsonText);
      } catch (error) {
        console.error('Error parsing insights JSON:', error);
        
        // Try to extract JSON from the response
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            insights = JSON.parse(jsonMatch[0]);
          } catch (innerError) {
            throw new Error('Could not parse insights data from response');
          }
        } else {
          throw new Error('Could not extract insights data from response');
        }
      }
      
      return {
        id: uuidv4(),
        documentId: document.id,
        insights,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error extracting insights:', error);
      throw error;
    }
  }
}

module.exports = GeminiAgent;
