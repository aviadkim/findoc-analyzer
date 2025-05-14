/**
 * Enhanced Chat Service
 * 
 * This service provides enhanced chat functionality for PDF documents, improving
 * the question answering capabilities when discussing document content.
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate an enhanced answer based on document content
 * @param {string} question - User's question
 * @param {object} document - Document data with text, tables, entities
 * @returns {Promise<string>} - Generated answer
 */
async function generateEnhancedAnswer(question, document) {
  try {
    console.log(`Generating enhanced answer for question: ${question}`);
    
    // Ensure document has required properties
    document = document || {};
    document.text = document.text || '';
    document.tables = document.tables || [];
    document.entities = document.entities || [];
    document.metadata = document.metadata || {};
    
    // Simple entity memory to track which entities were mentioned
    const mentionedEntities = [];
    
    // Convert question to lowercase for easier matching
    const lowerQuestion = question.toLowerCase();
    
    // Handle document summary questions
    if (lowerQuestion.includes('what is this document about') || 
        lowerQuestion.includes('summarize') || 
        lowerQuestion.includes('summary') || 
        lowerQuestion.includes('overview') || 
        lowerQuestion.includes('what does this document contain')) {
      
      return generateDocumentSummary(document);
    }
    
    // Handle table-related questions
    if (lowerQuestion.includes('table') || 
        lowerQuestion.includes('tables') || 
        lowerQuestion.includes('rows') || 
        lowerQuestion.includes('columns')) {
      
      return generateTableAnswer(document, lowerQuestion);
    }
    
    // Handle entity-specific questions
    const entityAnswer = generateEntityAnswer(document, lowerQuestion, mentionedEntities);
    if (entityAnswer) {
      return entityAnswer;
    }
    
    // Handle specific financial metrics
    if (lowerQuestion.includes('total assets') || 
        lowerQuestion.includes('total liabilities') || 
        lowerQuestion.includes('net worth') || 
        lowerQuestion.includes('portfolio value') || 
        lowerQuestion.includes('market value')) {
      
      return generateFinancialMetricAnswer(document, lowerQuestion);
    }
    
    // Handle date/time questions
    if (lowerQuestion.includes('when') || 
        lowerQuestion.includes('date') || 
        lowerQuestion.includes('time period') || 
        lowerQuestion.includes('year') || 
        lowerQuestion.includes('month')) {
      
      return generateDateAnswer(document, lowerQuestion);
    }
    
    // If no specific handling matched, return a general answer with document details
    return generateGeneralAnswer(document, question);
  } catch (error) {
    console.error(`Error generating enhanced answer: ${error.message}`);
    return `I apologize, but I encountered an error while processing your question. This appears to be a ${document.metadata.fileName || 'document'} that contains financial information. Could you please try asking your question differently?`;
  }
}

/**
 * Generate a summary of the document
 * @param {object} document - Document data
 * @returns {string} - Generated summary
 */
function generateDocumentSummary(document) {
  // Extract document information
  const { metadata, text, tables, entities } = document;
  const fileName = metadata.fileName || 'document';
  
  // Count entity types
  const entityTypes = {};
  entities.forEach(entity => {
    entityTypes[entity.type] = (entityTypes[entity.type] || 0) + 1;
  });
  
  // Format entity counts
  let entitySummary = '';
  if (Object.keys(entityTypes).length > 0) {
    entitySummary = 'It contains ';
    entitySummary += Object.entries(entityTypes)
      .map(([type, count]) => `${count} ${type}${count !== 1 ? 's' : ''}`)
      .join(', ');
    entitySummary += '.';
  }
  
  // Get file type
  const fileType = metadata.fileExt || 'PDF';
  
  // Create summary
  let summary = `This document (${fileName}) is a ${fileType.toUpperCase()} file `;
  
  if (metadata.title && metadata.title !== fileName) {
    summary += `titled "${metadata.title}" `;
  }
  
  if (metadata.author && metadata.author !== 'Unknown') {
    summary += `created by ${metadata.author} `;
  }
  
  summary += `containing ${text ? text.length : 0} characters of text`;
  
  if (tables && tables.length > 0) {
    summary += ` and ${tables.length} table${tables.length !== 1 ? 's' : ''}`;
  }
  
  summary += '. ';
  
  // Add entity summary
  summary += entitySummary;
  
  // Add content summary based on content analysis
  if (text) {
    if (text.toLowerCase().includes('portfolio') || 
        text.toLowerCase().includes('investment') || 
        text.toLowerCase().includes('security') || 
        text.toLowerCase().includes('asset')) {
      
      summary += ' The document appears to be a portfolio or investment report with details about securities and asset holdings.';
    } else if (text.toLowerCase().includes('balance sheet') || 
               text.toLowerCase().includes('income statement') || 
               text.toLowerCase().includes('cash flow')) {
      
      summary += ' The document appears to be a financial statement with balance sheet, income statement, or cash flow information.';
    } else if (text.toLowerCase().includes('account') || 
               text.toLowerCase().includes('transaction') || 
               text.toLowerCase().includes('deposit') || 
               text.toLowerCase().includes('withdrawal')) {
      
      summary += ' The document appears to be an account statement showing transactions, deposits, or withdrawals.';
    }
  }
  
  return summary;
}

/**
 * Generate an answer for table-related questions
 * @param {object} document - Document data
 * @param {string} lowerQuestion - Lowercase question
 * @returns {string} - Generated answer
 */
function generateTableAnswer(document, lowerQuestion) {
  const { tables } = document;
  
  if (!tables || tables.length === 0) {
    return "I couldn't find any tables in this document.";
  }
  
  // If asking for number of tables
  if (lowerQuestion.includes('how many tables') || 
      lowerQuestion.includes('number of tables')) {
    
    return `There ${tables.length === 1 ? 'is' : 'are'} ${tables.length} table${tables.length !== 1 ? 's' : ''} in this document.`;
  }
  
  // If asking for a specific table
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    const tableNumber = i + 1;
    
    // Look for table number in question
    if (lowerQuestion.includes(`table ${tableNumber}`) || 
        lowerQuestion.includes(`${tableNumber}st table`) || 
        lowerQuestion.includes(`${tableNumber}nd table`) || 
        lowerQuestion.includes(`${tableNumber}rd table`) || 
        lowerQuestion.includes(`${tableNumber}th table`)) {
      
      return formatTableResponse(table, tableNumber);
    }
    
    // Look for table title in question
    if (table.title && lowerQuestion.includes(table.title.toLowerCase())) {
      return formatTableResponse(table, tableNumber);
    }
  }
  
  // If asking for all tables or no specific table was found, return the first table
  return formatTableResponse(tables[0], 1, tables.length > 1);
}

/**
 * Format a table for response
 * @param {object} table - Table data
 * @param {number} tableNumber - Table number
 * @param {boolean} hasMoreTables - Whether there are more tables
 * @returns {string} - Formatted table response
 */
function formatTableResponse(table, tableNumber, hasMoreTables = false) {
  let response = '';
  
  if (table.title) {
    response += `Table ${tableNumber}: "${table.title}"\n\n`;
  } else {
    response += `Table ${tableNumber}:\n\n`;
  }
  
  // Generate markdown table
  if (table.headers && table.headers.length > 0) {
    // Add headers
    response += '| ' + table.headers.join(' | ') + ' |\n';
    response += '| ' + table.headers.map(() => '---').join(' | ') + ' |\n';
    
    // Add rows (limit to 5 for display)
    const rowsToShow = table.rows ? table.rows.slice(0, 5) : [];
    for (const row of rowsToShow) {
      response += '| ' + row.join(' | ') + ' |\n';
    }
    
    // If there are more rows than shown
    if (table.rows && table.rows.length > 5) {
      response += '\n(Showing 5 rows out of ' + table.rows.length + ' total rows)';
    }
  } else if (table.rows && table.rows.length > 0) {
    // No headers, just show rows
    for (let i = 0; i < Math.min(5, table.rows.length); i++) {
      response += JSON.stringify(table.rows[i]) + '\n';
    }
    
    if (table.rows.length > 5) {
      response += '\n(Showing 5 rows out of ' + table.rows.length + ' total rows)';
    }
  } else {
    response += 'This table appears to be empty.';
  }
  
  if (hasMoreTables) {
    response += '\n\nThere are more tables in this document. You can ask about a specific table by number or title.';
  }
  
  return response;
}

/**
 * Generate an answer for entity-related questions
 * @param {object} document - Document data
 * @param {string} lowerQuestion - Lowercase question
 * @param {Array} mentionedEntities - Array to track mentioned entities
 * @returns {string|null} - Generated answer or null if no entity found
 */
function generateEntityAnswer(document, lowerQuestion, mentionedEntities) {
  const { entities } = document;
  
  if (!entities || entities.length === 0) {
    if (lowerQuestion.includes('entity') || 
        lowerQuestion.includes('entities') || 
        lowerQuestion.includes('company') || 
        lowerQuestion.includes('companies') || 
        lowerQuestion.includes('security') || 
        lowerQuestion.includes('securities')) {
      
      return "I couldn't find any entities in this document.";
    }
    return null;
  }
  
  // If asking for a list of all entities
  if (lowerQuestion.includes('list of entities') || 
      lowerQuestion.includes('all entities') || 
      lowerQuestion.includes('show entities') || 
      lowerQuestion.includes('what entities')) {
    
    return formatEntityListResponse(entities);
  }
  
  // If asking about a specific entity type
  if (lowerQuestion.includes('companies') || lowerQuestion.includes('company')) {
    const companies = entities.filter(e => e.type === 'company');
    if (companies.length > 0) {
      return formatEntityTypeResponse(companies, 'company');
    }
  }
  
  if (lowerQuestion.includes('securities') || lowerQuestion.includes('security')) {
    const securities = entities.filter(e => e.type === 'security');
    if (securities.length > 0) {
      return formatEntityTypeResponse(securities, 'security');
    }
  }
  
  if (lowerQuestion.includes('metrics') || lowerQuestion.includes('financial metrics')) {
    const metrics = entities.filter(e => e.type === 'financialMetric');
    if (metrics.length > 0) {
      return formatEntityTypeResponse(metrics, 'financial metric');
    }
  }
  
  // If asking about a specific entity by name
  for (const entity of entities) {
    if (entity.name && lowerQuestion.includes(entity.name.toLowerCase())) {
      mentionedEntities.push(entity);
      return formatSpecificEntityResponse(entity, document);
    }
    
    if (entity.isin && lowerQuestion.includes(entity.isin.toLowerCase())) {
      mentionedEntities.push(entity);
      return formatSpecificEntityResponse(entity, document);
    }
    
    if (entity.ticker && lowerQuestion.includes(entity.ticker.toLowerCase())) {
      mentionedEntities.push(entity);
      return formatSpecificEntityResponse(entity, document);
    }
  }
  
  return null;
}

/**
 * Format a list of entities for response
 * @param {Array} entities - Entity data
 * @returns {string} - Formatted entity list response
 */
function formatEntityListResponse(entities) {
  if (!entities || entities.length === 0) {
    return "I couldn't find any entities in this document.";
  }
  
  // Group entities by type
  const groupedEntities = {};
  entities.forEach(entity => {
    const type = entity.type || 'unknown';
    if (!groupedEntities[type]) {
      groupedEntities[type] = [];
    }
    groupedEntities[type].push(entity);
  });
  
  let response = `I found the following entities in this document:\n\n`;
  
  // Format each entity type
  Object.entries(groupedEntities).forEach(([type, entities]) => {
    response += `${type.charAt(0).toUpperCase() + type.slice(1)}s (${entities.length}):\n`;
    
    const maxToShow = Math.min(5, entities.length);
    for (let i = 0; i < maxToShow; i++) {
      const entity = entities[i];
      response += `- ${entity.name || entity.isin || entity.value || 'Unknown'}`;
      
      // Add additional details
      const details = [];
      if (entity.isin && entity.name && !entity.name.includes(entity.isin)) {
        details.push(`ISIN: ${entity.isin}`);
      }
      if (entity.ticker && entity.name && !entity.name.includes(entity.ticker)) {
        details.push(`Ticker: ${entity.ticker}`);
      }
      if (entity.value && entity.type === 'financialMetric') {
        details.push(`Value: ${entity.value}`);
      }
      
      if (details.length > 0) {
        response += ` (${details.join(', ')})`;
      }
      
      response += '\n';
    }
    
    if (entities.length > 5) {
      response += `... and ${entities.length - 5} more ${type}s\n`;
    }
    
    response += '\n';
  });
  
  return response.trim();
}

/**
 * Format a specific entity type for response
 * @param {Array} entities - Entity data
 * @param {string} type - Entity type
 * @returns {string} - Formatted entity type response
 */
function formatEntityTypeResponse(entities, type) {
  if (!entities || entities.length === 0) {
    return `I couldn't find any ${type}s in this document.`;
  }
  
  let response = `I found ${entities.length} ${type}${entities.length !== 1 ? 's' : ''} in this document:\n\n`;
  
  const maxToShow = Math.min(10, entities.length);
  for (let i = 0; i < maxToShow; i++) {
    const entity = entities[i];
    response += `- ${entity.name || entity.isin || entity.value || 'Unknown'}`;
    
    // Add additional details
    const details = [];
    if (entity.isin && entity.name && !entity.name.includes(entity.isin)) {
      details.push(`ISIN: ${entity.isin}`);
    }
    if (entity.ticker && entity.name && !entity.name.includes(entity.ticker)) {
      details.push(`Ticker: ${entity.ticker}`);
    }
    if (entity.value) {
      details.push(`Value: ${entity.value}`);
    }
    
    if (details.length > 0) {
      response += ` (${details.join(', ')})`;
    }
    
    response += '\n';
  }
  
  if (entities.length > 10) {
    response += `... and ${entities.length - 10} more ${type}s`;
  }
  
  return response;
}

/**
 * Format a specific entity for response
 * @param {object} entity - Entity data
 * @param {object} document - Document data
 * @returns {string} - Formatted specific entity response
 */
function formatSpecificEntityResponse(entity, document) {
  let response = '';
  
  if (entity.type === 'company' || entity.type === 'security') {
    response += `${entity.name || entity.isin || 'This entity'} is a ${entity.type} mentioned in the document. `;
    
    if (entity.isin) {
      response += `Its ISIN is ${entity.isin}. `;
    }
    
    if (entity.ticker) {
      response += `Its ticker symbol is ${entity.ticker}. `;
    }
    
    if (entity.price) {
      response += `Its price is ${entity.price}. `;
    }
    
    if (entity.quantity) {
      response += `The quantity held is ${entity.quantity}. `;
    }
    
    if (entity.marketValue) {
      response += `Its market value is ${entity.marketValue}. `;
    }
    
    // Look for this entity in tables
    if (document.tables && document.tables.length > 0) {
      for (let i = 0; i < document.tables.length; i++) {
        const table = document.tables[i];
        
        if (table.headers && table.rows) {
          for (let j = 0; j < table.rows.length; j++) {
            const row = table.rows[j];
            const rowText = row.join(' ');
            
            if ((entity.name && rowText.includes(entity.name)) || 
                (entity.isin && rowText.includes(entity.isin)) || 
                (entity.ticker && rowText.includes(entity.ticker))) {
              
              response += `This ${entity.type} appears in Table ${i + 1}`;
              
              if (table.title) {
                response += ` ("${table.title}")`;
              }
              
              response += `. `;
              break;
            }
          }
        }
      }
    }
    
    // Look for additional information in text
    if (document.text) {
      const textSegments = document.text.split('\n');
      for (const segment of textSegments) {
        if ((entity.name && segment.includes(entity.name)) || 
            (entity.isin && segment.includes(entity.isin)) || 
            (entity.ticker && segment.includes(entity.ticker))) {
          
          if (segment.length < 200 && !response.includes(segment)) {
            response += `Additional information: "${segment.trim()}". `;
            break;
          }
        }
      }
    }
  } else if (entity.type === 'financialMetric') {
    response += `${entity.name || 'This metric'} is mentioned in the document with a value of ${entity.value || 'unknown'}. `;
  } else {
    response += `${entity.name || entity.value || 'This entity'} is a ${entity.type} mentioned in the document. `;
  }
  
  return response;
}

/**
 * Generate an answer for financial metric questions
 * @param {object} document - Document data
 * @param {string} lowerQuestion - Lowercase question
 * @returns {string} - Generated answer
 */
function generateFinancialMetricAnswer(document, lowerQuestion) {
  const { entities, text, tables } = document;
  
  // First, check if we have the metric in entities
  if (entities && entities.length > 0) {
    const metrics = entities.filter(e => e.type === 'financialMetric');
    
    for (const metric of metrics) {
      const metricName = metric.name ? metric.name.toLowerCase() : '';
      
      if ((lowerQuestion.includes('total assets') && metricName.includes('total assets')) || 
          (lowerQuestion.includes('total liabilities') && metricName.includes('total liabilities')) || 
          (lowerQuestion.includes('net worth') && metricName.includes('net worth')) || 
          (lowerQuestion.includes('portfolio value') && metricName.includes('portfolio value')) || 
          (lowerQuestion.includes('market value') && metricName.includes('market value'))) {
        
        return `The ${metric.name} is ${metric.value}.`;
      }
    }
  }
  
  // If not found in entities, search in text
  if (text) {
    const patterns = [
      { term: 'total assets', regex: /total assets[:\s]*[\$€£]?[\d,\.]+/i },
      { term: 'total liabilities', regex: /total liabilities[:\s]*[\$€£]?[\d,\.]+/i },
      { term: 'net worth', regex: /net worth[:\s]*[\$€£]?[\d,\.]+/i },
      { term: 'portfolio value', regex: /portfolio value[:\s]*[\$€£]?[\d,\.]+/i },
      { term: 'market value', regex: /market value[:\s]*[\$€£]?[\d,\.]+/i },
      { term: 'total value', regex: /total value[:\s]*[\$€£]?[\d,\.]+/i }
    ];
    
    for (const pattern of patterns) {
      if (lowerQuestion.includes(pattern.term)) {
        const match = text.match(pattern.regex);
        if (match) {
          return `Based on the document, the ${pattern.term} is ${match[0].split(/[:\s]/).pop()}.`;
        }
      }
    }
    
    // Generic financial metrics in text
    if (lowerQuestion.includes('financial metrics') || lowerQuestion.includes('key metrics')) {
      const metrics = [];
      
      for (const pattern of patterns) {
        const match = text.match(pattern.regex);
        if (match) {
          metrics.push(`${pattern.term}: ${match[0].split(/[:\s]/).pop()}`);
        }
      }
      
      if (metrics.length > 0) {
        return `I found the following financial metrics in the document:\n\n${metrics.join('\n')}`;
      }
    }
  }
  
  // If not found in text, check tables
  if (tables && tables.length > 0) {
    for (const table of tables) {
      if (table.headers && table.rows) {
        // Check for financial metric headers
        const metricColumnIndex = table.headers.findIndex(h => 
          h.toLowerCase().includes('metric') || 
          h.toLowerCase().includes('measure') || 
          h.toLowerCase().includes('item')
        );
        
        const valueColumnIndex = table.headers.findIndex(h => 
          h.toLowerCase().includes('value') || 
          h.toLowerCase().includes('amount') || 
          h.toLowerCase().includes('total')
        );
        
        if (metricColumnIndex !== -1 && valueColumnIndex !== -1) {
          for (const row of table.rows) {
            const metricName = row[metricColumnIndex] ? row[metricColumnIndex].toLowerCase() : '';
            
            if ((lowerQuestion.includes('total assets') && metricName.includes('total assets')) || 
                (lowerQuestion.includes('total liabilities') && metricName.includes('total liabilities')) || 
                (lowerQuestion.includes('net worth') && metricName.includes('net worth')) || 
                (lowerQuestion.includes('portfolio value') && metricName.includes('portfolio value')) || 
                (lowerQuestion.includes('market value') && metricName.includes('market value'))) {
              
              return `According to the table in the document, the ${row[metricColumnIndex]} is ${row[valueColumnIndex]}.`;
            }
          }
        }
      }
    }
  }
  
  return `I couldn't find specific information about the financial metric you're asking about in this document.`;
}

/**
 * Generate an answer for date-related questions
 * @param {object} document - Document data
 * @param {string} lowerQuestion - Lowercase question
 * @returns {string} - Generated answer
 */
function generateDateAnswer(document, lowerQuestion) {
  const { text, metadata } = document;
  
  // Check metadata for dates
  if (metadata) {
    if (lowerQuestion.includes('when was this document created') || 
        lowerQuestion.includes('creation date') || 
        lowerQuestion.includes('created on')) {
      
      if (metadata.creationDate) {
        try {
          const date = new Date(metadata.creationDate);
          return `This document was created on ${date.toLocaleDateString()}.`;
        } catch (e) {
          // If date parsing fails
          return `This document was created on ${metadata.creationDate}.`;
        }
      }
    }
    
    if (lowerQuestion.includes('when was this document modified') || 
        lowerQuestion.includes('modification date') || 
        lowerQuestion.includes('modified on') || 
        lowerQuestion.includes('last updated')) {
      
      if (metadata.modificationDate) {
        try {
          const date = new Date(metadata.modificationDate);
          return `This document was last modified on ${date.toLocaleDateString()}.`;
        } catch (e) {
          // If date parsing fails
          return `This document was last modified on ${metadata.modificationDate}.`;
        }
      }
    }
  }
  
  // Look for dates in text
  if (text) {
    // Common date patterns
    const datePatterns = [
      { name: 'report date', regex: /report date:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\w+ \d{1,2},? \d{4}|\d{1,2} \w+ \d{4})/i },
      { name: 'as of', regex: /as of:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\w+ \d{1,2},? \d{4}|\d{1,2} \w+ \d{4})/i },
      { name: 'date', regex: /date:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\w+ \d{1,2},? \d{4}|\d{1,2} \w+ \d{4})/i },
      { name: 'period ending', regex: /period ending:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\w+ \d{1,2},? \d{4}|\d{1,2} \w+ \d{4})/i },
      { name: 'statement date', regex: /statement date:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\w+ \d{1,2},? \d{4}|\d{1,2} \w+ \d{4})/i }
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern.regex);
      if (match) {
        return `The ${pattern.name} in this document is ${match[1]}.`;
      }
    }
    
    // Look for year mentions
    if (lowerQuestion.includes('year') || lowerQuestion.includes('which year')) {
      const yearMatch = text.match(/\b(20\d{2})\b/);
      if (yearMatch) {
        return `The document mentions the year ${yearMatch[1]}.`;
      }
    }
    
    // Look for quarter mentions
    if (lowerQuestion.includes('quarter') || lowerQuestion.includes('q1') || 
        lowerQuestion.includes('q2') || lowerQuestion.includes('q3') || 
        lowerQuestion.includes('q4')) {
      
      const quarterMatch = text.match(/\b(q[1-4]|first quarter|second quarter|third quarter|fourth quarter)\b/i);
      if (quarterMatch) {
        return `The document mentions ${quarterMatch[1]}.`;
      }
    }
  }
  
  return `I couldn't find specific date information in this document that answers your question.`;
}

/**
 * Generate a general answer for questions that don't match specific patterns
 * @param {object} document - Document data
 * @param {string} question - User's question
 * @returns {string} - Generated answer
 */
function generateGeneralAnswer(document, question) {
  const { text, tables, entities } = document;
  
  // Very simple keyword matching for general questions
  const lowerQuestion = question.toLowerCase();
  const lowerText = text.toLowerCase();
  
  // Extract key terms from the question (excluding stop words)
  const stopWords = ['what', 'where', 'when', 'who', 'how', 'why', 'is', 'are', 'the', 'this', 'document', 'about', 'in', 'on', 'at', 'to', 'a', 'an'];
  const questionTerms = lowerQuestion.split(/\s+/).filter(term => !stopWords.includes(term));
  
  // Find paragraph that best matches the question terms
  let bestParagraph = '';
  let bestScore = 0;
  
  // Split text into paragraphs
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  for (const paragraph of paragraphs) {
    const lowerParagraph = paragraph.toLowerCase();
    let score = 0;
    
    // Score each paragraph based on how many question terms it contains
    for (const term of questionTerms) {
      if (lowerParagraph.includes(term)) {
        score += 1;
      }
    }
    
    // Boost score for paragraphs that aren't too long or too short
    if (paragraph.length > 50 && paragraph.length < 500) {
      score += 0.5;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestParagraph = paragraph;
    }
  }
  
  // If we found a good match
  if (bestScore >= 2 && bestParagraph) {
    return `Based on the document, I found this information that might answer your question:\n\n"${bestParagraph.trim()}"`;
  }
  
  // If no good paragraph match, provide a general answer
  return `This appears to be a financial document containing information about securities, financial metrics, and portfolio data. It includes ${entities.length} entities and ${tables.length} tables. If you have specific questions about the content, please ask about particular sections, entities, or tables.`;
}

module.exports = {
  generateEnhancedAnswer,
  generateDocumentSummary,
  generateTableAnswer,
  generateEntityAnswer,
  generateFinancialMetricAnswer,
  generateDateAnswer,
  generateGeneralAnswer
};