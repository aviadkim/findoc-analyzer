/**
 * FinDoc Analyzer Frontend
 */

// API base URL
const API_BASE_URL = '/api';

// Authentication token
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// DOM elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutButton = document.getElementById('logout-button');
const uploadForm = document.getElementById('upload-form');
const documentsList = document.getElementById('documents-list');
const apiKeysList = document.getElementById('api-keys-list');
const addApiKeyForm = document.getElementById('add-api-key-form');
const chatForm = document.getElementById('chat-form');
const chatMessages = document.getElementById('chat-messages');
const authSection = document.getElementById('auth-section');
const mainSection = document.getElementById('main-section');
const userInfo = document.getElementById('user-info');
const errorContainer = document.getElementById('error-container');

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  errorContainer.textContent = message;
  errorContainer.style.display = 'block';
  setTimeout(() => {
    errorContainer.style.display = 'none';
  }, 5000);
}

/**
 * Make API request
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {object} data - Request data
 * @returns {Promise<object>} Response data
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add authentication token if available
    if (authToken) {
      options.headers.Authorization = `Bearer ${authToken}`;
    }

    // Add request body if data is provided
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'API request failed');
    }

    return responseData;
  } catch (error) {
    console.error('API request error:', error);
    showError(error.message);
    throw error;
  }
}

/**
 * Upload file
 * @param {File} file - File to upload
 * @returns {Promise<object>} Upload result
 */
async function uploadFile(file) {
  try {
    const formData = new FormData();
    formData.append('document', file);

    const url = `${API_BASE_URL}/documents`;
    const options = {
      method: 'POST',
      headers: {}
    };

    // Add authentication token if available
    if (authToken) {
      options.headers.Authorization = `Bearer ${authToken}`;
    }

    options.body = formData;

    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'File upload failed');
    }

    return responseData;
  } catch (error) {
    console.error('File upload error:', error);
    showError(error.message);
    throw error;
  }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 */
async function login(email, password) {
  try {
    const response = await apiRequest('/auth/login', 'POST', { email, password });

    // Save authentication token and user data
    authToken = response.data.token;
    currentUser = response.data.user;

    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Update UI
    updateAuthUI();
    loadDocuments();
    loadApiKeys();
  } catch (error) {
    console.error('Login error:', error);
    showError('Login failed: ' + error.message);
  }
}

/**
 * Register user
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} organization - User organization
 */
async function register(name, email, password, organization) {
  try {
    const response = await apiRequest('/auth/register', 'POST', {
      name,
      email,
      password,
      organization
    });

    // Save authentication token and user data
    authToken = response.data.token;
    currentUser = response.data.user;

    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Update UI
    updateAuthUI();
    loadDocuments();
    loadApiKeys();
  } catch (error) {
    console.error('Registration error:', error);
    showError('Registration failed: ' + error.message);
  }
}

/**
 * Logout user
 */
function logout() {
  // Clear authentication token and user data
  authToken = null;
  currentUser = null;

  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');

  // Update UI
  updateAuthUI();
}

/**
 * Update authentication UI
 */
function updateAuthUI() {
  if (authToken && currentUser) {
    // User is authenticated
    authSection.style.display = 'none';
    mainSection.style.display = 'block';
    userInfo.textContent = `${currentUser.name} (${currentUser.email})`;
  } else {
    // User is not authenticated
    authSection.style.display = 'block';
    mainSection.style.display = 'none';
    userInfo.textContent = '';
  }
}

/**
 * Load documents
 */
async function loadDocuments() {
  if (!authToken) return;

  try {
    const response = await apiRequest('/documents');
    const documents = response.data;

    // Clear documents list
    documentsList.innerHTML = '';

    // Add documents to list
    if (documents.length === 0) {
      documentsList.innerHTML = '<p>No documents found</p>';
    } else {
      documents.forEach(doc => {
        const docItem = document.createElement('div');
        docItem.className = 'document-item';
        docItem.innerHTML = `
          <h3>${doc.name}</h3>
          <p>Type: ${doc.type}</p>
          <p>Status: ${doc.status}</p>
          <p>Uploaded: ${new Date(doc.uploadedAt).toLocaleString()}</p>
          <div class="document-actions">
            <button class="process-button" data-id="${doc.id}">Process</button>
            <button class="view-button" data-id="${doc.id}">View</button>
            <button class="delete-button" data-id="${doc.id}">Delete</button>
          </div>
        `;
        documentsList.appendChild(docItem);
      });

      // Add event listeners
      document.querySelectorAll('.process-button').forEach(button => {
        button.addEventListener('click', async (e) => {
          const docId = e.target.dataset.id;
          try {
            await apiRequest(`/documents/${docId}/process`, 'POST');
            loadDocuments(); // Reload documents
          } catch (error) {
            console.error('Process error:', error);
          }
        });
      });

      document.querySelectorAll('.view-button').forEach(button => {
        button.addEventListener('click', (e) => {
          const docId = e.target.dataset.id;
          window.location.href = `/document.html?id=${docId}`;
        });
      });

      document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', async (e) => {
          const docId = e.target.dataset.id;
          if (confirm('Are you sure you want to delete this document?')) {
            try {
              await apiRequest(`/documents/${docId}`, 'DELETE');
              loadDocuments(); // Reload documents
            } catch (error) {
              console.error('Delete error:', error);
            }
          }
        });
      });
    }
  } catch (error) {
    console.error('Load documents error:', error);
    documentsList.innerHTML = '<p>Error loading documents</p>';
  }
}

/**
 * Load API keys
 */
async function loadApiKeys() {
  if (!authToken) return;

  try {
    const response = await apiRequest('/api-keys');
    const apiKeys = response.data;

    // Clear API keys list
    apiKeysList.innerHTML = '';

    // Add API keys to list
    if (apiKeys.length === 0) {
      apiKeysList.innerHTML = '<p>No API keys found</p>';
    } else {
      apiKeys.forEach(key => {
        const keyItem = document.createElement('div');
        keyItem.className = 'api-key-item';
        keyItem.innerHTML = `
          <h3>${key.name}</h3>
          <p>Type: ${key.type}</p>
          <p>Key: ${key.key}</p>
          <div class="api-key-actions">
            <button class="delete-key-button" data-id="${key.id}">Delete</button>
          </div>
        `;
        apiKeysList.appendChild(keyItem);
      });

      // Add event listeners
      document.querySelectorAll('.delete-key-button').forEach(button => {
        button.addEventListener('click', async (e) => {
          const keyId = e.target.dataset.id;
          if (confirm('Are you sure you want to delete this API key?')) {
            try {
              await apiRequest(`/api-keys/${keyId}`, 'DELETE');
              loadApiKeys(); // Reload API keys
            } catch (error) {
              console.error('Delete API key error:', error);
            }
          }
        });
      });
    }
  } catch (error) {
    console.error('Load API keys error:', error);
    apiKeysList.innerHTML = '<p>Error loading API keys</p>';
  }
}

/**
 * Add API key
 * @param {string} name - API key name
 * @param {string} type - API key type
 * @param {string} key - API key value
 */
async function addApiKey(name, type, key) {
  try {
    await apiRequest('/api-keys', 'POST', { name, type, key });
    loadApiKeys(); // Reload API keys
  } catch (error) {
    console.error('Add API key error:', error);
    showError('Failed to add API key: ' + error.message);
  }
}

/**
 * Send chat message
 * @param {string} message - Chat message
 */
async function sendChatMessage(message) {
  try {
    // Add user message to chat
    addChatMessage('user', message);

    // Send message to API
    const response = await apiRequest('/chat', 'POST', { message });

    // Add response to chat
    addChatMessage('assistant', response.data.response);
  } catch (error) {
    console.error('Chat error:', error);
    showError('Failed to send message: ' + error.message);
  }
}

/**
 * Add chat message to UI
 * @param {string} role - Message role (user or assistant)
 * @param {string} content - Message content
 */
function addChatMessage(role, content) {
  const messageElement = document.createElement('div');
  messageElement.className = `chat-message ${role}-message`;
  messageElement.innerHTML = `
    <div class="message-content">${content}</div>
  `;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event listeners
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    login(email, password);
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const organization = document.getElementById('register-organization').value;
    register(name, email, password, organization);
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    logout();
  });
}

if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('document-file');
    const file = fileInput.files[0];

    if (!file) {
      showError('Please select a file to upload');
      return;
    }

    try {
      await uploadFile(file);
      fileInput.value = ''; // Clear file input
      loadDocuments(); // Reload documents
    } catch (error) {
      console.error('Upload error:', error);
    }
  });
}

if (addApiKeyForm) {
  addApiKeyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('api-key-name').value;
    const type = document.getElementById('api-key-type').value;
    const key = document.getElementById('api-key-value').value;
    addApiKey(name, type, key);
  });
}

if (chatForm) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageInput = document.getElementById('chat-message');
    const message = messageInput.value.trim();

    if (message) {
      sendChatMessage(message);
      messageInput.value = ''; // Clear input
    }
  });
}

// Mobile navigation
const mobileNavToggle = document.getElementById('mobile-nav-toggle');
const sidebar = document.getElementById('sidebar');
const sidebarClose = document.getElementById('sidebar-close');
const navLinks = document.querySelectorAll('.nav-link');

if (mobileNavToggle) {
  mobileNavToggle.addEventListener('click', () => {
    sidebar.classList.add('active');
    sidebarClose.style.display = 'block';
  });
}

if (sidebarClose) {
  sidebarClose.addEventListener('click', () => {
    sidebar.classList.remove('active');
    sidebarClose.style.display = 'none';
  });
}

if (navLinks) {
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        sidebarClose.style.display = 'none';
      }
    });
  });
}

// Feedback system
const showFeedbackButton = document.createElement('button');
showFeedbackButton.id = 'show-feedback-button';
showFeedbackButton.className = 'feedback-button';
showFeedbackButton.innerHTML = 'Feedback';
document.body.appendChild(showFeedbackButton);

const feedbackModal = document.createElement('div');
feedbackModal.id = 'feedback-modal';
feedbackModal.className = 'modal';
feedbackModal.innerHTML = `
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2>Provide Feedback</h2>
    <form id="feedback-form">
      <div class="form-group">
        <label for="feedback-type">Feedback Type</label>
        <select id="feedback-type" required>
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Request</option>
          <option value="improvement">Improvement Suggestion</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label for="feedback-message">Message</label>
        <textarea id="feedback-message" rows="5" required></textarea>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" id="feedback-include-page">
          Include current page information
        </label>
      </div>
      <button type="submit">Submit Feedback</button>
    </form>
  </div>
`;
document.body.appendChild(feedbackModal);

// Feedback event listeners
showFeedbackButton.addEventListener('click', () => {
  feedbackModal.style.display = 'block';
});

feedbackModal.querySelector('.close').addEventListener('click', () => {
  feedbackModal.style.display = 'none';
});

document.getElementById('feedback-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const type = document.getElementById('feedback-type').value;
  const message = document.getElementById('feedback-message').value;
  const includePage = document.getElementById('feedback-include-page').checked;

  const feedbackData = {
    type,
    message,
    page: includePage ? window.location.href : null,
    timestamp: new Date().toISOString()
  };

  try {
    await apiRequest('/feedback', 'POST', feedbackData);

    feedbackModal.style.display = 'none';
    showMessage('Thank you for your feedback!', 'success');

    // Reset form
    document.getElementById('feedback-form').reset();
  } catch (error) {
    console.error('Feedback error:', error);
    showMessage('Failed to submit feedback. Please try again.', 'error');
  }
});

// Show message
function showMessage(message, type = 'info') {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}-message`;
  messageElement.textContent = message;

  document.body.appendChild(messageElement);

  setTimeout(() => {
    messageElement.classList.add('show');
  }, 10);

  setTimeout(() => {
    messageElement.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(messageElement);
    }, 300);
  }, 3000);
}

// Initialize UI
updateAuthUI();
if (authToken) {
  loadDocuments();
  loadApiKeys();

  // Show mobile navigation toggle
  if (mobileNavToggle) {
    mobileNavToggle.style.display = 'block';
  }
}
