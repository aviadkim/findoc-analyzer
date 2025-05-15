import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import FinDocLayout from '../components/FinDocLayout';
import EnhancedFeedbackForm from '../components/feedback/EnhancedFeedbackForm';
import FeedbackHistory from '../components/feedback/FeedbackHistory';
import { trackPageView } from '../services/analyticsService';

/**
 * Enhanced Feedback Page
 * 
 * A modern, user-friendly feedback page with an enhanced feedback form
 * and feedback history section.
 * 
 * @component
 */
const EnhancedFeedbackPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Track page view
  useEffect(() => {
    trackPageView('/enhanced-feedback', 'Enhanced Feedback Page');
  }, []);
  
  // Check for dark mode preference
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    
    // Add dark mode class to body if needed
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Clean up
    return () => {
      document.body.classList.remove('dark-mode');
    };
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };
  
  // Handle feedback submission success
  const handleFeedbackSuccess = (data) => {
    console.log('Feedback submitted successfully:', data);
    // Refresh feedback history after submission
    if (showHistory) {
      setShowHistory(false);
      setTimeout(() => setShowHistory(true), 100);
    }
  };
  
  return (
    <>
      <Head>
        <title>Enhanced Feedback | FinDoc Analyzer</title>
        <meta name="description" content="Provide feedback on the FinDoc Analyzer application" />
        <link rel="stylesheet" href="/styles/enhanced-feedback.css" />
      </Head>
      
      <FinDocLayout>
        <div className={`enhanced-feedback-page ${darkMode ? 'dark-mode' : ''}`}>
          <div className="page-header">
            <div className="header-content">
              <h1 className="page-title">Feedback</h1>
              <p className="page-description">
                We value your feedback! Please let us know what you think about the FinDoc Analyzer application.
                Your input helps us improve the user experience.
              </p>
            </div>
            <div className="header-actions">
              <button 
                className="mode-toggle"
                onClick={toggleDarkMode}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button 
                className="history-toggle"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? 'Hide History' : 'Show History'}
              </button>
            </div>
          </div>
          
          <div className="page-content">
            <div className="feedback-container">
              <EnhancedFeedbackForm onSubmitSuccess={handleFeedbackSuccess} />
            </div>
            
            {showHistory && (
              <div className="history-container">
                <FeedbackHistory />
              </div>
            )}
          </div>
        </div>
        
        <style jsx>{`
          .enhanced-feedback-page {
            padding: 20px;
            transition: all 0.3s ease;
          }
          
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
          }
          
          .header-content {
            flex: 1;
          }
          
          .page-title {
            font-size: 2rem;
            font-weight: 700;
            color: #2d3748;
            margin: 0 0 10px 0;
          }
          
          .page-description {
            color: #718096;
            margin: 0;
            max-width: 800px;
            line-height: 1.5;
          }
          
          .header-actions {
            display: flex;
            gap: 10px;
          }
          
          .mode-toggle,
          .history-toggle {
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .mode-toggle {
            background: none;
            border: none;
            font-size: 1.2rem;
            padding: 8px;
          }
          
          .history-toggle {
            background-color: white;
            color: #4a5568;
            border: 1px solid #e2e8f0;
          }
          
          .history-toggle:hover {
            background-color: #f8fafc;
          }
          
          .page-content {
            display: flex;
            flex-direction: column;
            gap: 30px;
          }
          
          .feedback-container {
            width: 100%;
          }
          
          .history-container {
            width: 100%;
            margin-top: 20px;
          }
          
          /* Dark Mode Styles */
          .dark-mode .page-title {
            color: #e2e8f0;
          }
          
          .dark-mode .page-description {
            color: #a0aec0;
          }
          
          .dark-mode .history-toggle {
            background-color: #2d3748;
            color: #e2e8f0;
            border-color: #4a5568;
          }
          
          .dark-mode .history-toggle:hover {
            background-color: #4a5568;
          }
          
          /* Responsive Styles */
          @media (min-width: 1024px) {
            .page-content {
              flex-direction: row;
              align-items: flex-start;
            }
            
            .feedback-container {
              width: 60%;
            }
            
            .history-container {
              width: 40%;
              margin-top: 0;
            }
          }
          
          @media (max-width: 768px) {
            .page-header {
              flex-direction: column;
              gap: 15px;
            }
            
            .header-actions {
              width: 100%;
              justify-content: flex-end;
            }
            
            .page-title {
              font-size: 1.5rem;
            }
          }
        `}</style>
      </FinDocLayout>
    </>
  );
};

export default EnhancedFeedbackPage;
