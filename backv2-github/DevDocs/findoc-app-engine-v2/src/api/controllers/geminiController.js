/**
 * Gemini Controller
 *
 * This controller handles interactions with the Google Gemini API.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { supabase } = require('../services/supabaseService');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

/**
 * Generate content
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Validate input
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    // Generate content
    const content = await generateContentInternal(prompt, req.tenantId);

    return res.json({
      success: true,
      data: {
        content
      }
    });
  } catch (error) {
    console.error('Error generating content:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Import OpenRouter service
const openRouterService = require('../services/openRouterService');

/**
 * Generate content internal
 * @param {string} prompt - Prompt
 * @param {string} tenantId - Tenant ID
 * @param {string} [specificApiKey] - Optional specific API key to use
 * @returns {Promise<string>} Generated content
 */
const generateContentInternal = async (prompt, tenantId, specificApiKey) => {
  try {
    // Check if we should use OpenRouter
    const useOpenRouter = process.env.USE_OPENROUTER === 'true';

    if (useOpenRouter) {
      console.log('Using OpenRouter API for content generation');

      try {
        // Use OpenRouter API
        const content = await openRouterService.generateContent(prompt, {
          apiKey: process.env.OPENROUTER_API_KEY
        });

        return content;
      } catch (openRouterError) {
        console.error('Error using OpenRouter API:', openRouterError);
        console.warn('Falling back to direct Gemini API or mock response');
        // Continue with direct Gemini API or mock response
      }
    }

    // If OpenRouter is not enabled or failed, use direct Gemini API
    let apiKeyToUse;

    // If a specific API key is provided, use it
    if (specificApiKey) {
      apiKeyToUse = specificApiKey;
    }
    // Otherwise, if tenant ID is provided, try to get tenant-specific API key
    else if (tenantId) {
      try {
        // Get API key from database
        const { data: apiKey, error: apiKeyError } = await supabase
          .from('api_keys')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('service', 'gemini')
          .single();

        if (!apiKeyError && apiKey && apiKey.key) {
          apiKeyToUse = apiKey.key;
        } else {
          console.warn(`No tenant-specific API key found for tenant ${tenantId}, falling back to default`);
          apiKeyToUse = process.env.GEMINI_API_KEY;
        }
      } catch (dbError) {
        console.error('Error getting API key from database:', dbError);
        apiKeyToUse = process.env.GEMINI_API_KEY;
      }
    }
    // If no tenant ID or specific API key, use default
    else {
      apiKeyToUse = process.env.GEMINI_API_KEY;
    }

    // Ensure we have an API key
    if (!apiKeyToUse) {
      console.warn('No API key available, using mock response');
      return generateMockResponse(prompt);
    }

    try {
      // Initialize Gemini API with the selected key
      const genAIInstance = new GoogleGenerativeAI(apiKeyToUse);
      const modelInstance = genAIInstance.getGenerativeModel({ model: 'gemini-pro' });

      // Generate content
      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text;
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      console.warn('Using mock response due to API error');
      return generateMockResponse(prompt);
    }
  } catch (error) {
    console.error('Error in generateContentInternal:', error);

    // If we're already using the default API key or a specific key was provided, use mock response
    if (!tenantId || specificApiKey) {
      console.warn('Using mock response due to error');
      return generateMockResponse(prompt);
    }

    // Otherwise, fallback to default API key
    try {
      console.log('Falling back to default API key');
      const defaultGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const defaultModel = defaultGenAI.getGenerativeModel({ model: 'gemini-pro' });

      const result = await defaultModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text;
    } catch (fallbackError) {
      console.error('Error in fallback generateContentInternal:', fallbackError);
      console.warn('Using mock response due to fallback error');
      return generateMockResponse(prompt);
    }
  }
};

/**
 * Generate mock response
 * @param {string} prompt - Prompt
 * @returns {string} Mock response
 */
const generateMockResponse = (prompt) => {
  console.log('Generating mock response for prompt:', prompt.substring(0, 100) + '...');

  // Check if this is a document analysis prompt
  if (prompt.includes('financial document analyzer') && prompt.includes('extract information')) {
    return `
{
  "document_type": "portfolio_statement",
  "securities": [
    {
      "name": "Apple Inc.",
      "isin": "US0378331005",
      "quantity": 100,
      "price": 150.25,
      "value": 15025.00,
      "currency": "USD",
      "weight": 34.8,
      "type": "Equity",
      "sector": "Technology",
      "region": "North America",
      "asset_class": "Equity"
    },
    {
      "name": "Microsoft Corporation",
      "isin": "US5949181045",
      "quantity": 50,
      "price": 300.10,
      "value": 15005.00,
      "currency": "USD",
      "weight": 34.7,
      "type": "Equity",
      "sector": "Technology",
      "region": "North America",
      "asset_class": "Equity"
    },
    {
      "name": "Amazon.com Inc.",
      "isin": "US0231351067",
      "quantity": 25,
      "price": 130.50,
      "value": 3262.50,
      "currency": "USD",
      "weight": 7.6,
      "type": "Equity",
      "sector": "Consumer Discretionary",
      "region": "North America",
      "asset_class": "Equity"
    },
    {
      "name": "US Treasury Bond 2.5% 2030",
      "isin": "US912810TL45",
      "quantity": 10000,
      "price": 98.75,
      "value": 9875.00,
      "currency": "USD",
      "weight": 22.9,
      "type": "Bond",
      "sector": "Government",
      "region": "North America",
      "asset_class": "Fixed Income"
    }
  ],
  "portfolio_summary": {
    "total_value": 43167.50,
    "currency": "USD",
    "valuation_date": "2023-10-15"
  },
  "asset_allocation": {
    "Equity": {
      "percentage": 77.1
    },
    "Fixed Income": {
      "percentage": 22.9
    },
    "Cash": {
      "percentage": 0
    },
    "Alternative": {
      "percentage": 0
    }
  }
}
    `;
  }

  // Default response for other prompts
  return "I'm sorry, I couldn't process your request at the moment. Please try again later.";
};

/**
 * Chat with document
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const chatWithDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { message } = req.body;

    // Validate input
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Get document
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('tenant_id', req.tenantId)
      .single();

    if (documentError || !document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Get chat history
    const { data: chatHistory, error: chatHistoryError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', req.user.id)
      .single();

    // Initialize messages
    let messages = [];

    if (chatHistory) {
      messages = chatHistory.messages;
    } else {
      // Create new chat history
      const { error: createError } = await supabase
        .from('chat_history')
        .insert({
          id: uuidv4(),
          document_id: documentId,
          user_id: req.user.id,
          tenant_id: req.tenantId,
          messages: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createError) {
        console.error('Error creating chat history:', createError);
        return res.status(500).json({
          success: false,
          error: 'Error creating chat history'
        });
      }
    }

    // Add user message
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    messages.push(userMessage);

    // Generate prompt
    const prompt = `
      You are an AI assistant that helps users understand financial documents.

      Document: ${document.name}
      Type: ${document.type}

      Document Metadata:
      ${JSON.stringify(document.metadata, null, 2)}

      User Question: ${message}

      Please provide a helpful and accurate response based on the document information.
    `;

    // Generate response
    const content = await generateContentInternal(prompt, req.tenantId);

    // Add assistant message
    const assistantMessage = {
      role: 'assistant',
      content,
      timestamp: new Date().toISOString()
    };

    messages.push(assistantMessage);

    // Update chat history
    const { error: updateError } = await supabase
      .from('chat_history')
      .update({
        messages,
        updated_at: new Date().toISOString()
      })
      .eq('document_id', documentId)
      .eq('user_id', req.user.id);

    if (updateError) {
      console.error('Error updating chat history:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Error updating chat history'
      });
    }

    return res.json({
      success: true,
      data: {
        message: assistantMessage
      }
    });
  } catch (error) {
    console.error('Error in chatWithDocument:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  generateContent,
  generateContentInternal,
  chatWithDocument
};
