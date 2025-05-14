/**
 * Document Chat Page Object Model
 * 
 * This class provides functionality for the Document Chat page.
 */

const { BasePage } = require('./base-page');

class DocumentChatPage extends BasePage {
  /**
   * Create a new document chat page object
   * @param {import('@playwright/test').Page} page - Playwright page
   */
  constructor(page) {
    super(page);
    
    // Specific selectors for document chat page
    this.pageSelectors = {
      documentList: '.document-list, .documents-grid',
      documentCard: '.document-card, .card.document',
      documentTitle: '.document-title, .card-title',
      documentSubtitle: '.document-subtitle, .card-subtitle',
      documentPreview: '.document-preview, .preview',
      documentSelect: '.document-select, .select-document',
      chatContainer: '.chat-container, .chat-panel',
      chatInput: '#document-chat-input, .chat-input, input.chat-input',
      chatSendButton: '#document-send-btn, .send-button, button.send',
      chatMessages: '.chat-messages, .message-list, .conversation',
      chatMessage: '.chat-message, .message',
      userMessage: '.user-message, .message.user, .message.outgoing',
      botMessage: '.bot-message, .message.bot, .message.incoming',
      loadingIndicator: '.loading, .spinner, .loader',
      errorMessage: '.error, .error-message, .alert-danger',
      noDocumentSelected: '.no-document, .select-document-prompt',
    };
  }

  /**
   * Navigate to document chat page
   * @returns {Promise<void>}
   */
  async goto() {
    await super.goto('/document-chat');
  }

  /**
   * Check if document list is visible
   * @returns {Promise<boolean>} - Whether document list is visible
   */
  async hasDocumentList() {
    return await this.isVisible(this.pageSelectors.documentList);
  }

  /**
   * Check if chat container is visible
   * @returns {Promise<boolean>} - Whether chat container is visible
   */
  async hasChatContainer() {
    return await this.isVisible(this.pageSelectors.chatContainer);
  }

  /**
   * Get document cards
   * @returns {Promise<number>} - Number of document cards
   */
  async getDocumentCount() {
    const documentCards = this.page.locator(this.pageSelectors.documentCard);
    return await documentCards.count();
  }

  /**
   * Select a document by index
   * @param {number} index - Document index
   * @returns {Promise<void>}
   */
  async selectDocument(index = 0) {
    const documentCards = this.page.locator(this.pageSelectors.documentCard);
    await documentCards.nth(index).click();
    await this.waitForLoading();
  }

  /**
   * Select a document by title
   * @param {string} title - Document title
   * @returns {Promise<void>}
   */
  async selectDocumentByTitle(title) {
    const documentTitles = this.page.locator(this.pageSelectors.documentTitle);
    const count = await documentTitles.count();
    
    for (let i = 0; i < count; i++) {
      const text = await documentTitles.nth(i).textContent();
      if (text.trim().includes(title)) {
        await documentTitles.nth(i).click();
        await this.waitForLoading();
        return;
      }
    }
    
    throw new Error(`Document with title "${title}" not found`);
  }

  /**
   * Send a chat message
   * @param {string} message - Message to send
   * @returns {Promise<void>}
   */
  async sendMessage(message) {
    await this.fill(this.pageSelectors.chatInput, message);
    await this.click(this.pageSelectors.chatSendButton);
    await this.waitForLoading();
  }

  /**
   * Get chat messages
   * @returns {Promise<{text: string, isUser: boolean}[]>} - List of chat messages
   */
  async getChatMessages() {
    const userMessages = this.page.locator(this.pageSelectors.userMessage);
    const botMessages = this.page.locator(this.pageSelectors.botMessage);
    
    const userCount = await userMessages.count();
    const botCount = await botMessages.count();
    
    const messages = [];
    
    // Collect user messages
    for (let i = 0; i < userCount; i++) {
      const text = await userMessages.nth(i).textContent();
      messages.push({ text: text.trim(), isUser: true });
    }
    
    // Collect bot messages
    for (let i = 0; i < botCount; i++) {
      const text = await botMessages.nth(i).textContent();
      messages.push({ text: text.trim(), isUser: false });
    }
    
    // Sort messages by their position in the DOM
    return messages.sort((a, b) => {
      return a.position - b.position;
    });
  }

  /**
   * Get last chat message
   * @returns {Promise<string|null>} - Last chat message
   */
  async getLastMessage() {
    const messages = await this.getChatMessages();
    if (messages.length > 0) {
      return messages[messages.length - 1].text;
    }
    return null;
  }

  /**
   * Check if a specific message exists in the chat
   * @param {string} text - Message text to search for
   * @param {Object} options - Search options
   * @param {boolean} options.exact - Whether to match exactly
   * @param {boolean} options.fromUser - Whether to match user messages only
   * @param {boolean} options.fromBot - Whether to match bot messages only
   * @returns {Promise<boolean>} - Whether message exists
   */
  async hasMessage(text, options = { exact: false, fromUser: false, fromBot: false }) {
    const messages = await this.getChatMessages();
    
    return messages.some(message => {
      // Check sender
      if (options.fromUser && !message.isUser) return false;
      if (options.fromBot && message.isUser) return false;
      
      // Check text
      if (options.exact) {
        return message.text === text;
      } else {
        return message.text.includes(text);
      }
    });
  }

  /**
   * Check if error message is displayed
   * @returns {Promise<boolean>} - Whether error message is displayed
   */
  async hasErrorMessage() {
    return await this.isVisible(this.pageSelectors.errorMessage);
  }

  /**
   * Get error message
   * @returns {Promise<string|null>} - Error message
   */
  async getErrorMessage() {
    if (await this.hasErrorMessage()) {
      return await this.getText(this.pageSelectors.errorMessage);
    }
    return null;
  }

  /**
   * Select document and ask question
   * @param {string} documentTitle - Document title
   * @param {string} question - Question to ask
   * @returns {Promise<string|null>} - Response message
   */
  async selectDocumentAndAskQuestion(documentTitle, question) {
    // Navigate to document chat page
    await this.goto();
    
    // Select document by title
    await this.selectDocumentByTitle(documentTitle);
    
    // Send message
    await this.sendMessage(question);
    
    // Wait for response
    await this.page.waitForTimeout(1000);
    
    // Return last message
    return await this.getLastMessage();
  }
}

module.exports = { DocumentChatPage };