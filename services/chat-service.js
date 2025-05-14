/**
 * Chat Service
 * Handles AI chat functionality for documents and general inquiries
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const documentService = require('./document-service');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Configuration 
const config = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  chatLogsDir: process.env.CHAT_LOGS_DIR || path.join(process.cwd(), 'chat-logs'),
  maxHistoryLength: parseInt(process.env.MAX_CHAT_HISTORY || '10'),
  defaultModel: process.env.DEFAULT_MODEL || 'gpt-3.5-turbo',
  defaultTimeout: parseInt(process.env.CHAT_TIMEOUT || '20000')
};

// Ensure chat logs directory exists
(async () => {
  try {
    await mkdirAsync(config.chatLogsDir, { recursive: true });
    console.log('Chat logs directory created');
  } catch (error) {
    console.error('Error creating chat logs directory:', error);
  }
})();

/**
 * Chat with document
 * @param {string} documentId - Document ID 
 * @param {string} message - User message
 * @param {string} sessionId - Chat session ID (optional)
 * @returns {Promise<object>} - Chat response
 */
async function chatWithDocument(documentId, message, sessionId = null) {
  try {
    // Get document
    const document = await documentService.getDocument(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }
    
    // Get chat history if a session ID is provided
    let chatHistory = [];
    if (sessionId) {
      chatHistory = await getChatHistory(sessionId);
    }
    
    // Add user message to history
    chatHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    // Generate response
    let response;
    let provider;
    
    // Try different AI providers
    if (config.openaiApiKey) {
      try {
        const result = await chatWithOpenAI(document, message, chatHistory);
        response = result.response;
        provider = 'openai';
      } catch (error) {
        console.error('Error with OpenAI chat:', error);
        // Fall through to next provider
      }
    }
    
    if (!response && config.anthropicApiKey) {
      try {
        const result = await chatWithAnthropic(document, message, chatHistory);
        response = result.response;
        provider = 'anthropic';
      } catch (error) {
        console.error('Error with Anthropic chat:', error);
        // Fall through to next provider
      }
    }
    
    if (!response && config.geminiApiKey) {
      try {
        const result = await chatWithGemini(document, message, chatHistory);
        response = result.response;
        provider = 'gemini';
      } catch (error) {
        console.error('Error with Gemini chat:', error);
        // Fall through to fallback
      }
    }
    
    // If all AI providers failed, use rule-based fallback
    if (!response) {
      const result = ruleBasedDocumentChat(document, message);
      response = result.response;
      provider = 'rule-based';
    }
    
    // Add assistant response to history
    chatHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      provider
    });
    
    // Trim history to max length
    if (chatHistory.length > config.maxHistoryLength * 2) {
      // Keep the first message (system prompt) and the most recent messages
      chatHistory = [
        ...chatHistory.slice(0, 1),
        ...chatHistory.slice(-config.maxHistoryLength * 2 + 1)
      ];
    }
    
    // Save chat history if session ID is provided
    if (sessionId) {
      await saveChatHistory(sessionId, chatHistory);
    }
    
    return {
      documentId,
      message,
      response,
      timestamp: new Date().toISOString(),
      provider,
      sessionId: sessionId || generateSessionId(documentId)
    };
  } catch (error) {
    console.error(`Error in chat with document ${documentId}:`, error);
    
    return {
      documentId,
      message,
      response: `I'm sorry, I encountered an error while processing your question. ${error.message}`,
      timestamp: new Date().toISOString(),
      provider: 'error',
      sessionId: sessionId || generateSessionId(documentId)
    };
  }
}

/**
 * General chat without a specific document
 * @param {string} message - User message
 * @param {string} sessionId - Chat session ID (optional)
 * @returns {Promise<object>} - Chat response
 */
async function generalChat(message, sessionId = null) {
  try {
    // Get chat history if a session ID is provided
    let chatHistory = [];
    if (sessionId) {
      chatHistory = await getChatHistory(sessionId);
    }
    
    // Add user message to history
    chatHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    // Generate response
    let response;
    let provider;
    
    // Try different AI providers
    if (config.openaiApiKey) {
      try {
        const result = await generalChatWithOpenAI(message, chatHistory);
        response = result.response;
        provider = 'openai';
      } catch (error) {
        console.error('Error with OpenAI general chat:', error);
        // Fall through to next provider
      }
    }
    
    if (!response && config.anthropicApiKey) {
      try {
        const result = await generalChatWithAnthropic(message, chatHistory);
        response = result.response;
        provider = 'anthropic';
      } catch (error) {
        console.error('Error with Anthropic general chat:', error);
        // Fall through to next provider
      }
    }
    
    if (!response && config.geminiApiKey) {
      try {
        const result = await generalChatWithGemini(message, chatHistory);
        response = result.response;
        provider = 'gemini';
      } catch (error) {
        console.error('Error with Gemini general chat:', error);
        // Fall through to fallback
      }
    }
    
    // If all AI providers failed, use rule-based fallback
    if (!response) {
      response = "I'm a financial document assistant. I can help answer questions about your documents, but I need you to select a document first. You can upload a document on the Upload page or select an existing document from the Documents page.";
      provider = 'rule-based';
    }
    
    // Add assistant response to history
    chatHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      provider
    });
    
    // Trim history to max length
    if (chatHistory.length > config.maxHistoryLength * 2) {
      // Keep the first message (system prompt) and the most recent messages
      chatHistory = [
        ...chatHistory.slice(0, 1),
        ...chatHistory.slice(-config.maxHistoryLength * 2 + 1)
      ];
    }
    
    // Save chat history if session ID is provided
    if (sessionId) {
      await saveChatHistory(sessionId, chatHistory);
    }
    
    return {
      message,
      response,
      timestamp: new Date().toISOString(),
      provider,
      sessionId: sessionId || generateSessionId()
    };
  } catch (error) {
    console.error('Error in general chat:', error);
    
    return {
      message,
      response: `I'm sorry, I encountered an error while processing your question. ${error.message}`,
      timestamp: new Date().toISOString(),
      provider: 'error',
      sessionId: sessionId || generateSessionId()
    };
  }
}

/**
 * Chat with OpenAI (document-specific)
 * @param {object} document - Document object
 * @param {string} message - User message
 * @param {Array} chatHistory - Chat history
 * @returns {Promise<object>} - OpenAI response
 */
async function chatWithOpenAI(document, message, chatHistory = []) {
  try {
    // Extract document content
    const documentContent = document.content?.text || 'No text available';
    const tables = document.content?.tables || [];
    
    // Format tables as text
    let tablesText = '';
    if (tables.length > 0) {
      tablesText = tables.map(table => {
        const headers = table.headers.join(' | ');
        const rows = table.rows.map(row => row.join(' | ')).join('\n');
        return `Table: ${table.title || 'Untitled'}\n${headers}\n${rows}`;
      }).join('\n\n');
    }
    
    // Create system message
    const systemMessage = {
      role: 'system',
      content: `You are an AI assistant specializing in financial document analysis.
      
Document Information:
Title: ${document.fileName}
Type: ${document.documentType}
ID: ${document.id}

Document Content:
${documentContent}

${tablesText ? `Tables:\n${tablesText}` : ''}

Instructions:
- Answer the user's questions based on the document content above.
- If the answer is not in the document, say that you don't have that information.
- Be concise but thorough in your answers.
- When referring to numbers, use the exact values from the document.
- For financial data, be precise about currency and percentages.`
    };
    
    // Format chat history for OpenAI
    const formattedHistory = chatHistory.map(message => ({
      role: message.role,
      content: message.content
    }));
    
    // Ensure the system message is at the beginning
    if (formattedHistory.length === 0 || formattedHistory[0].role !== 'system') {
      formattedHistory.unshift(systemMessage);
    }
    
    // Make API call to OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: config.defaultModel,
        messages: formattedHistory,
        max_tokens: 500,
        temperature: 0.2
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.openaiApiKey}`
        },
        timeout: config.defaultTimeout
      }
    );
    
    return {
      response: response.data.choices[0].message.content.trim()
    };
  } catch (error) {
    console.error('Error with OpenAI document chat:', error);
    throw new Error(`OpenAI document chat failed: ${error.message}`);
  }
}

/**
 * Chat with Anthropic (document-specific)
 * @param {object} document - Document object
 * @param {string} message - User message
 * @param {Array} chatHistory - Chat history
 * @returns {Promise<object>} - Anthropic response
 */
async function chatWithAnthropic(document, message, chatHistory = []) {
  try {
    // Extract document content
    const documentContent = document.content?.text || 'No text available';
    const tables = document.content?.tables || [];
    
    // Format tables as text
    let tablesText = '';
    if (tables.length > 0) {
      tablesText = tables.map(table => {
        const headers = table.headers.join(' | ');
        const rows = table.rows.map(row => row.join(' | ')).join('\n');
        return `Table: ${table.title || 'Untitled'}\n${headers}\n${rows}`;
      }).join('\n\n');
    }
    
    // Create system message
    const systemPrompt = `You are an AI assistant specializing in financial document analysis.
      
Document Information:
Title: ${document.fileName}
Type: ${document.documentType}
ID: ${document.id}

Document Content:
${documentContent}

${tablesText ? `Tables:\n${tablesText}` : ''}

Instructions:
- Answer the user's questions based on the document content above.
- If the answer is not in the document, say that you don't have that information.
- Be concise but thorough in your answers.
- When referring to numbers, use the exact values from the document.
- For financial data, be precise about currency and percentages.`;
    
    // Format user message
    const userMessage = message;
    
    // Make API call to Anthropic
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-haiku-20240307',
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        max_tokens: 500,
        temperature: 0.2
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        timeout: config.defaultTimeout
      }
    );
    
    return {
      response: response.data.content[0].text.trim()
    };
  } catch (error) {
    console.error('Error with Anthropic document chat:', error);
    throw new Error(`Anthropic document chat failed: ${error.message}`);
  }
}

/**
 * Chat with Gemini (document-specific)
 * @param {object} document - Document object
 * @param {string} message - User message
 * @param {Array} chatHistory - Chat history
 * @returns {Promise<object>} - Gemini response
 */
async function chatWithGemini(document, message, chatHistory = []) {
  try {
    // Extract document content
    const documentContent = document.content?.text || 'No text available';
    const tables = document.content?.tables || [];
    
    // Format tables as text
    let tablesText = '';
    if (tables.length > 0) {
      tablesText = tables.map(table => {
        const headers = table.headers.join(' | ');
        const rows = table.rows.map(row => row.join(' | ')).join('\n');
        return `Table: ${table.title || 'Untitled'}\n${headers}\n${rows}`;
      }).join('\n\n');
    }
    
    // Create prompt
    const prompt = `You are an AI assistant specializing in financial document analysis.
      
Document Information:
Title: ${document.fileName}
Type: ${document.documentType}
ID: ${document.id}

Document Content:
${documentContent}

${tablesText ? `Tables:\n${tablesText}` : ''}

Instructions:
- Answer the user's questions based on the document content above.
- If the answer is not in the document, say that you don't have that information.
- Be concise but thorough in your answers.
- When referring to numbers, use the exact values from the document.
- For financial data, be precise about currency and percentages.

User Question: ${message}`;
    
    // Make API call to Gemini
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500,
          topP: 0.95,
          topK: 40
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          key: config.geminiApiKey
        },
        timeout: config.defaultTimeout
      }
    );
    
    // Extract response text
    const responseText = response.data.candidates[0].content.parts[0].text;
    
    return {
      response: responseText.trim()
    };
  } catch (error) {
    console.error('Error with Gemini document chat:', error);
    throw new Error(`Gemini document chat failed: ${error.message}`);
  }
}

/**
 * General chat with OpenAI
 * @param {string} message - User message
 * @param {Array} chatHistory - Chat history
 * @returns {Promise<object>} - OpenAI response
 */
async function generalChatWithOpenAI(message, chatHistory = []) {
  try {
    // Create system message
    const systemMessage = {
      role: 'system',
      content: `You are a Financial Document Assistant, an AI that specializes in helping users understand and analyze financial documents.
      
You can:
- Answer questions about financial concepts
- Guide users on how to use the system
- Explain how to upload and process documents
- Describe the document analysis capabilities

You cannot:
- Access or analyze documents that haven't been explicitly uploaded and shared
- Provide specific financial advice or recommendations
- Access real-time market data unless it's provided in the conversation

Always be helpful, accurate, and concise in your responses.`
    };
    
    // Format chat history for OpenAI
    const formattedHistory = chatHistory.map(message => ({
      role: message.role,
      content: message.content
    }));
    
    // Ensure the system message is at the beginning
    if (formattedHistory.length === 0 || formattedHistory[0].role !== 'system') {
      formattedHistory.unshift(systemMessage);
    }
    
    // Make API call to OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: config.defaultModel,
        messages: formattedHistory,
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.openaiApiKey}`
        },
        timeout: config.defaultTimeout
      }
    );
    
    return {
      response: response.data.choices[0].message.content.trim()
    };
  } catch (error) {
    console.error('Error with OpenAI general chat:', error);
    throw new Error(`OpenAI general chat failed: ${error.message}`);
  }
}

/**
 * General chat with Anthropic
 * @param {string} message - User message
 * @param {Array} chatHistory - Chat history
 * @returns {Promise<object>} - Anthropic response
 */
async function generalChatWithAnthropic(message, chatHistory = []) {
  try {
    // Create system message
    const systemPrompt = `You are a Financial Document Assistant, an AI that specializes in helping users understand and analyze financial documents.
      
You can:
- Answer questions about financial concepts
- Guide users on how to use the system
- Explain how to upload and process documents
- Describe the document analysis capabilities

You cannot:
- Access or analyze documents that haven't been explicitly uploaded and shared
- Provide specific financial advice or recommendations
- Access real-time market data unless it's provided in the conversation

Always be helpful, accurate, and concise in your responses.`;
    
    // Format user message
    const userMessage = message;
    
    // Make API call to Anthropic
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-haiku-20240307',
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        timeout: config.defaultTimeout
      }
    );
    
    return {
      response: response.data.content[0].text.trim()
    };
  } catch (error) {
    console.error('Error with Anthropic general chat:', error);
    throw new Error(`Anthropic general chat failed: ${error.message}`);
  }
}

/**
 * General chat with Gemini
 * @param {string} message - User message
 * @param {Array} chatHistory - Chat history
 * @returns {Promise<object>} - Gemini response
 */
async function generalChatWithGemini(message, chatHistory = []) {
  try {
    // Create prompt
    const prompt = `You are a Financial Document Assistant, an AI that specializes in helping users understand and analyze financial documents.
      
You can:
- Answer questions about financial concepts
- Guide users on how to use the system
- Explain how to upload and process documents
- Describe the document analysis capabilities

You cannot:
- Access or analyze documents that haven't been explicitly uploaded and shared
- Provide specific financial advice or recommendations
- Access real-time market data unless it's provided in the conversation

Always be helpful, accurate, and concise in your responses.

User Question: ${message}`;
    
    // Make API call to Gemini
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          topP: 0.95,
          topK: 40
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          key: config.geminiApiKey
        },
        timeout: config.defaultTimeout
      }
    );
    
    // Extract response text
    const responseText = response.data.candidates[0].content.parts[0].text;
    
    return {
      response: responseText.trim()
    };
  } catch (error) {
    console.error('Error with Gemini general chat:', error);
    throw new Error(`Gemini general chat failed: ${error.message}`);
  }
}

/**
 * Rule-based document chat fallback
 * @param {object} document - Document object
 * @param {string} message - User message
 * @returns {object} - Response object
 */
function ruleBasedDocumentChat(document, message) {
  const lowerMessage = message.toLowerCase();
  let response = "I don't have that information in the document.";
  
  // Extract text and tables from document
  const text = document.content?.text || '';
  const tables = document.content?.tables || [];
  
  // Check document type and respond accordingly
  if (document.documentType === 'financial') {
    if (lowerMessage.includes('revenue') || lowerMessage.includes('sales')) {
      const match = text.match(/revenue:?\s*\$?([\d,]+)/i);
      if (match) {
        response = `The revenue is $${match[1]}.`;
      }
    } else if (lowerMessage.includes('profit')) {
      const match = text.match(/profit:?\s*\$?([\d,]+)/i);
      if (match) {
        response = `The profit is $${match[1]}.`;
      }
      
      const marginMatch = text.match(/margin:?\s*([\d.]+)%/i);
      if (marginMatch) {
        response += ` The profit margin is ${marginMatch[1]}%.`;
      }
    } else if (lowerMessage.includes('expense')) {
      const match = text.match(/expenses:?\s*\$?([\d,]+)/i);
      if (match) {
        response = `The expenses are $${match[1]}.`;
      }
    } else if (lowerMessage.includes('asset')) {
      const match = text.match(/assets:?\s*\$?([\d,]+)/i);
      if (match) {
        response = `The total assets are $${match[1]}.`;
      }
    } else if (lowerMessage.includes('liabilit')) {
      const match = text.match(/liabilities:?\s*\$?([\d,]+)/i);
      if (match) {
        response = `The total liabilities are $${match[1]}.`;
      }
    } else if (lowerMessage.includes('equity')) {
      const match = text.match(/equity:?\s*\$?([\d,]+)/i);
      if (match) {
        response = `The shareholders' equity is $${match[1]}.`;
      }
    }
  } else if (document.documentType === 'portfolio') {
    if (lowerMessage.includes('value') || lowerMessage.includes('total') || lowerMessage.includes('worth')) {
      const match = text.match(/value:?\s*\$?([\d,]+)/i);
      if (match) {
        response = `The total portfolio value is $${match[1]}.`;
      }
    } else if (lowerMessage.includes('return')) {
      const match = text.match(/return:?\s*([\d.]+)%/i);
      if (match) {
        response = `The annual return is ${match[1]}%.`;
      }
    } else if (lowerMessage.includes('risk')) {
      const match = text.match(/risk:?\s*(\w+)/i);
      if (match) {
        response = `The risk level is ${match[1]}.`;
      }
    } else if (lowerMessage.includes('allocation') || lowerMessage.includes('distribution')) {
      // Look for allocation information in tables
      const allocationTable = tables.find(table => 
        table.title?.toLowerCase().includes('allocation') || 
        table.headers?.some(header => header.toLowerCase().includes('allocation'))
      );
      
      if (allocationTable) {
        response = 'The asset allocation is: ';
        allocationTable.rows.forEach(row => {
          response += `${row[0]}: ${row[1]} (${row[2]}), `;
        });
        response = response.slice(0, -2); // Remove trailing comma and space
      } else {
        // Look in text
        const match = text.match(/allocation:?\s*([^.]+)/i);
        if (match) {
          response = `The asset allocation is ${match[1]}.`;
        }
      }
    }
  } else if (document.documentType === 'tax') {
    if (lowerMessage.includes('income')) {
      const match = text.match(/income:?\s*\$?([\d,]+)/i);
      if (match) {
        response = `The total income is $${match[1]}.`;
      }
    } else if (lowerMessage.includes('deduction')) {
      const match = text.match(/deductions:?\s*\$?([\d,]+)/i);
      if (match) {
        response = `The total deductions are $${match[1]}.`;
      }
    } else if (lowerMessage.includes('taxable')) {
      const match = text.match(/taxable income:?\s*\$?([\d,]+)/i);
      if (match) {
        response = `The taxable income is $${match[1]}.`;
      }
    } else if (lowerMessage.includes('tax') && (lowerMessage.includes('due') || lowerMessage.includes('owed') || lowerMessage.includes('payable'))) {
      const match = text.match(/tax due:?\s*\$?([\d,]+)/i);
      if (match) {
        response = `The tax due is $${match[1]}.`;
      }
    }
  }
  
  // Check for specific securities
  const securities = ['apple', 'microsoft', 'amazon', 'tesla', 'google'];
  for (const security of securities) {
    if (lowerMessage.includes(security)) {
      // Check tables for the security
      for (const table of tables) {
        const securityRow = table.rows.find(row => 
          row[0].toLowerCase().includes(security)
        );
        
        if (securityRow) {
          if (table.headers.includes('ISIN')) {
            const isinIndex = table.headers.indexOf('ISIN');
            response = `${securityRow[0]} has ISIN ${securityRow[isinIndex]}.`;
          }
          
          if (table.headers.includes('Current Value') || table.headers.includes('Value')) {
            const valueIndex = table.headers.indexOf('Current Value') >= 0 
              ? table.headers.indexOf('Current Value') 
              : table.headers.indexOf('Value');
            
            if (valueIndex >= 0) {
              response += ` The current value is ${securityRow[valueIndex]}.`;
            }
          }
          
          if (table.headers.includes('% of Assets')) {
            const percentIndex = table.headers.indexOf('% of Assets');
            response += ` It represents ${securityRow[percentIndex]} of the portfolio.`;
          }
          
          break;
        }
      }
    }
  }
  
  // Generic document information
  if (lowerMessage.includes('what') && lowerMessage.includes('this') && lowerMessage.includes('document')) {
    response = `This is a ${document.documentType} document titled "${document.fileName}". `;
    
    if (document.documentType === 'financial') {
      response += "It contains financial information such as revenue, expenses, profit, and balance sheet details.";
    } else if (document.documentType === 'portfolio') {
      response += "It contains investment portfolio information including asset allocation, returns, and security holdings.";
    } else if (document.documentType === 'tax') {
      response += "It contains tax information including income, deductions, and tax calculations.";
    } else {
      response += "It contains various financial information.";
    }
  }
  
  return {
    response
  };
}

/**
 * Generate a session ID
 * @param {string} prefix - Optional prefix (e.g., document ID)
 * @returns {string} - Session ID
 */
function generateSessionId(prefix = '') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${prefix ? prefix + '-' : ''}${timestamp}-${random}`;
}

/**
 * Get chat history
 * @param {string} sessionId - Chat session ID
 * @returns {Promise<Array>} - Chat history
 */
async function getChatHistory(sessionId) {
  try {
    const historyPath = path.join(config.chatLogsDir, `${sessionId}.json`);
    
    if (fs.existsSync(historyPath)) {
      const historyData = await readFileAsync(historyPath, 'utf8');
      return JSON.parse(historyData);
    }
    
    return [];
  } catch (error) {
    console.error(`Error retrieving chat history for session ${sessionId}:`, error);
    return [];
  }
}

/**
 * Save chat history
 * @param {string} sessionId - Chat session ID
 * @param {Array} chatHistory - Chat history
 * @returns {Promise<boolean>} - Success status
 */
async function saveChatHistory(sessionId, chatHistory) {
  try {
    const historyPath = path.join(config.chatLogsDir, `${sessionId}.json`);
    
    await writeFileAsync(historyPath, JSON.stringify(chatHistory, null, 2));
    
    return true;
  } catch (error) {
    console.error(`Error saving chat history for session ${sessionId}:`, error);
    return false;
  }
}

module.exports = {
  chatWithDocument,
  generalChat,
  getChatHistory,
  saveChatHistory,
  generateSessionId
};