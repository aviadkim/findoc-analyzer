import React, { useState } from 'react';
import FinDocLayout from '../components/FinDocLayout';
import { FiSend, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedbackType: 'general',
    rating: 3,
    message: '',
    page: 'dashboard'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Simulate successful submission
      console.log('Feedback submitted:', formData);
      setSubmitStatus('success');
      setIsSubmitting(false);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
        setFormData({
          name: '',
          email: '',
          feedbackType: 'general',
          rating: 3,
          message: '',
          page: 'dashboard'
        });
      }, 3000);
    }, 1500);
  };
  
  return (
    <FinDocLayout>
      <div className="feedback-page">
        <h1 className="page-title">Feedback</h1>
        <p className="page-description">
          We value your feedback! Please let us know what you think about the FinDoc Analyzer application.
          Your input helps us improve the user experience.
        </p>
        
        {submitStatus === 'success' ? (
          <div className="success-message">
            <FiCheckCircle size={48} />
            <h2>Thank You!</h2>
            <p>Your feedback has been submitted successfully.</p>
          </div>
        ) : submitStatus === 'error' ? (
          <div className="error-message">
            <FiAlertCircle size={48} />
            <h2>Submission Error</h2>
            <p>There was an error submitting your feedback. Please try again later.</p>
          </div>
        ) : (
          <form className="feedback-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email address"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="feedbackType">Feedback Type</label>
              <select
                id="feedbackType"
                name="feedbackType"
                value={formData.feedbackType}
                onChange={handleChange}
                required
              >
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="ui">UI/UX Feedback</option>
                <option value="performance">Performance Issue</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="page">Page</label>
              <select
                id="page"
                name="page"
                value={formData.page}
                onChange={handleChange}
                required
              >
                <option value="dashboard">Dashboard</option>
                <option value="documents">Documents</option>
                <option value="analytics">Analytics</option>
                <option value="upload">Upload</option>
                <option value="chat">Document Chat</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Rating</label>
              <div className="rating-container">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    className={`rating-btn ${formData.rating >= rating ? 'active' : ''}`}
                    onClick={() => handleRatingChange(rating)}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Feedback</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Please provide your feedback here..."
                rows="5"
                required
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <FiSend />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        )}
      </div>
      
      <style jsx>{`
        .feedback-page {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .page-title {
          font-size: 1.75rem;
          color: #2d3748;
          margin: 0 0 10px 0;
        }
        
        .page-description {
          color: #718096;
          margin-bottom: 30px;
        }
        
        .feedback-form {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          padding: 30px;
          border: 1px solid #e2e8f0;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #4a5568;
        }
        
        input, select, textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
        
        .rating-container {
          display: flex;
          gap: 10px;
        }
        
        .rating-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background-color: white;
          color: #718096;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .rating-btn:hover {
          background-color: #f7fafc;
        }
        
        .rating-btn.active {
          background-color: #3498db;
          color: white;
          border-color: #3498db;
        }
        
        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 20px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .submit-btn:hover {
          background-color: #2980b9;
        }
        
        .submit-btn:disabled {
          background-color: #a0aec0;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .success-message, .error-message {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          padding: 30px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }
        
        .success-message {
          border-top: 4px solid #48bb78;
        }
        
        .error-message {
          border-top: 4px solid #f56565;
        }
        
        .success-message svg {
          color: #48bb78;
          margin-bottom: 15px;
        }
        
        .error-message svg {
          color: #f56565;
          margin-bottom: 15px;
        }
        
        .success-message h2, .error-message h2 {
          margin: 0 0 10px 0;
          font-size: 1.5rem;
        }
        
        .success-message p, .error-message p {
          margin: 0;
          color: #718096;
        }
      `}</style>
    </FinDocLayout>
  );
}
