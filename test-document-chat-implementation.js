/**
 * Test script for the document service and chat service implementations
 * 
 * This script verifies that the document loading, processing, and 
 * chat functionality are working correctly.
 */

// Import services
const documentService = require('./services/document-service');
const chatService = require('./services/chat-service');

// Test document service
async function testDocumentService() {
  console.log('\n=== TESTING DOCUMENT SERVICE ===\n');
  
  try {
    // Test getAllDocuments
    console.log('Testing getAllDocuments...');
    const documents = await documentService.getAllDocuments();
    console.log(`Retrieved ${documents.length} documents`);
    
    if (documents.length > 0) {
      console.log(`First document: ${JSON.stringify(documents[0], null, 2)}`);
    }
    
    // Test getDocument
    console.log('\nTesting getDocument...');
    const documentId = documents.length > 0 ? documents[0].id : 'doc-1';
    const document = await documentService.getDocument(documentId);
    
    if (document) {
      console.log(`Retrieved document ${documentId}: ${document.fileName}`);
      console.log(`Document type: ${document.documentType}`);
      console.log(`Document content length: ${document.content?.text?.length || 0} characters`);
      console.log(`Document has ${document.content?.tables?.length || 0} tables`);
    } else {
      console.log(`Document ${documentId} not found`);
    }
    
    // Test processDocument
    console.log('\nTesting processDocument...');
    const processedDocument = await documentService.processDocument(documentId);
    console.log(`Processed document ${documentId}`);
    console.log(`Processed document status: ${processedDocument.status}`);
    
    return documentId; // Return a document ID for chat testing
  } catch (error) {
    console.error('Error testing document service:', error);
    // Fallback to a default document for chat testing
    return 'doc-1';
  }
}

// Test chat service
async function testChatService(documentId) {
  console.log('\n=== TESTING CHAT SERVICE ===\n');
  
  try {
    // Test document chat
    console.log('Testing document chat...');
    const documentChatResponse = await chatService.chatWithDocument(
      documentId,
      'What is the total revenue in this document?'
    );
    
    console.log(`Document chat response for ${documentId}:`);
    console.log(`- Query: ${documentChatResponse.message}`);
    console.log(`- Response: ${documentChatResponse.response}`);
    console.log(`- Provider: ${documentChatResponse.provider}`);
    
    // Test general chat
    console.log('\nTesting general chat...');
    const generalChatResponse = await chatService.generalChat(
      'How can I use this system to analyze financial documents?'
    );
    
    console.log('General chat response:');
    console.log(`- Query: ${generalChatResponse.message}`);
    console.log(`- Response: ${generalChatResponse.response}`);
    console.log(`- Provider: ${generalChatResponse.provider}`);
    
    // Test chat history
    console.log('\nTesting chat history...');
    const sessionId = documentChatResponse.sessionId;
    console.log(`Session ID: ${sessionId}`);
    
    const history = await chatService.getChatHistory(sessionId);
    console.log(`Chat history has ${history.length} messages`);
    
  } catch (error) {
    console.error('Error testing chat service:', error);
  }
}

// Run the tests
async function runTests() {
  try {
    console.log('Starting tests...');
    
    const documentId = await testDocumentService();
    await testChatService(documentId);
    
    console.log('\n=== ALL TESTS COMPLETED ===\n');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

runTests();