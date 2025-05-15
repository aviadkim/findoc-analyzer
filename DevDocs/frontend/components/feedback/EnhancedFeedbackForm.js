import React, { useState } from 'react';
import { FiSend, FiCheckCircle, FiAlertCircle, FiStar } from 'react-icons/fi';
import axios from 'axios';

/**
 * Enhanced Feedback Form Component
 * 
 * A modern, user-friendly feedback form with rating stars, category selection,
 * and comment field. Includes form validation, responsive design, and
 * success/error message display.
 * 
 * @component
 */
const EnhancedFeedbackForm = ({ onSubmitSuccess, onCancel }) => {
  // Form state
  const [formData, setFormData] = useState({
    feedbackType: 'general',
    feedbackCategories: [],
    rating: 0,
    comments: '',
    email: '',
    allowContact: false
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  const [errors, setErrors] = useState({});
  const [hoveredRating, setHoveredRating] = useState(0);
  
  // Available feedback types
  const feedbackTypes = [
    { value: 'general', label: 'General Feedback' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'ui', label: 'UI/UX Feedback' },
    { value: 'performance', label: 'Performance Issue' }
  ];
  
  // Available categories based on feedback type
  const categoryOptions = {
    general: [
      { value: 'usability', label: 'Usability' },
      { value: 'content', label: 'Content' },
      { value: 'overall', label: 'Overall Experience' }
    ],
    bug: [
      { value: 'crash', label: 'Application Crash' },
      { value: 'data', label: 'Data Issue' },
      { value: 'ui', label: 'UI Problem' },
      { value: 'performance', label: 'Performance Problem' }
    ],
    feature: [
      { value: 'new', label: 'New Feature' },
      { value: 'enhancement', label: 'Enhancement' },
      { value: 'integration', label: 'Integration Request' }
    ],
    ui: [
      { value: 'layout', label: 'Layout' },
      { value: 'colors', label: 'Colors' },
      { value: 'responsiveness', label: 'Responsiveness' },
      { value: 'accessibility', label: 'Accessibility' }
    ],
    performance: [
      { value: 'slow', label: 'Slow Loading' },
      { value: 'memory', label: 'High Memory Usage' },
      { value: 'network', label: 'Network Issues' }
    ]
  };
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Reset categories when feedback type changes
      if (name === 'feedbackType') {
        setFormData(prev => ({
          ...prev,
          feedbackCategories: []
        }));
      }
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle category selection
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setFormData(prev => ({
        ...prev,
        feedbackCategories: [...prev.feedbackCategories, value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        feedbackCategories: prev.feedbackCategories.filter(cat => cat !== value)
      }));
    }
    
    // Clear error for categories
    if (errors.feedbackCategories) {
      setErrors(prev => ({
        ...prev,
        feedbackCategories: null
      }));
    }
  };
  
  // Handle rating selection
  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
    
    // Clear error for rating
    if (errors.rating) {
      setErrors(prev => ({
        ...prev,
        rating: null
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.feedbackType) {
      newErrors.feedbackType = 'Please select a feedback type';
    }
    
    if (formData.feedbackCategories.length === 0) {
      newErrors.feedbackCategories = 'Please select at least one category';
    }
    
    if (formData.rating === 0) {
      newErrors.rating = 'Please provide a rating';
    }
    
    if (!formData.comments.trim()) {
      newErrors.comments = 'Please provide your feedback';
    } else if (formData.comments.trim().length < 10) {
      newErrors.comments = 'Feedback must be at least 10 characters';
    }
    
    if (formData.allowContact && !formData.email) {
      newErrors.email = 'Email is required if you want to be contacted';
    } else if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Submit feedback to API
      const response = await axios.post('/api/feedback', {
        feedbackType: formData.feedbackType,
        categories: formData.feedbackCategories,
        rating: formData.rating,
        comments: formData.comments,
        email: formData.email,
        allowContact: formData.allowContact,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      
      // Handle success
      setSubmitStatus('success');
      
      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
        setFormData({
          feedbackType: 'general',
          feedbackCategories: [],
          rating: 0,
          comments: '',
          email: '',
          allowContact: false
        });
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <div className="enhanced-feedback-form">
      {submitStatus === 'success' ? (
        <div className="success-message">
          <FiCheckCircle size={48} />
          <h2>Thank You!</h2>
          <p>Your feedback has been submitted successfully.</p>
          <button 
            className="primary-button"
            onClick={() => setSubmitStatus(null)}
          >
            Submit Another Feedback
          </button>
        </div>
      ) : submitStatus === 'error' ? (
        <div className="error-message">
          <FiAlertCircle size={48} />
          <h2>Submission Error</h2>
          <p>There was an error submitting your feedback. Please try again later.</p>
          <button 
            className="primary-button"
            onClick={() => setSubmitStatus(null)}
          >
            Try Again
          </button>
        </div>
      ) : (
        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>What type of feedback do you have?</h3>
            <div className="feedback-type-options">
              {feedbackTypes.map(type => (
                <label 
                  key={type.value} 
                  className={`feedback-type-option ${formData.feedbackType === type.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="feedbackType"
                    value={type.value}
                    checked={formData.feedbackType === type.value}
                    onChange={handleChange}
                    className="visually-hidden"
                  />
                  <span className="option-label">{type.label}</span>
                </label>
              ))}
            </div>
            {errors.feedbackType && <div className="error-text">{errors.feedbackType}</div>}
          </div>
          
          <div className="form-section">
            <h3>Please select relevant categories</h3>
            <div className="categories-options">
              {categoryOptions[formData.feedbackType]?.map(category => (
                <label key={category.value} className="category-option">
                  <input
                    type="checkbox"
                    name="feedbackCategories"
                    value={category.value}
                    checked={formData.feedbackCategories.includes(category.value)}
                    onChange={handleCategoryChange}
                  />
                  <span>{category.label}</span>
                </label>
              ))}
            </div>
            {errors.feedbackCategories && <div className="error-text">{errors.feedbackCategories}</div>}
          </div>
          
          <div className="form-section">
            <h3>How would you rate your experience?</h3>
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  className={`rating-btn ${formData.rating >= rating ? 'active' : ''} ${hoveredRating >= rating ? 'hovered' : ''}`}
                  onClick={() => handleRatingChange(rating)}
                  onMouseEnter={() => setHoveredRating(rating)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <FiStar />
                </button>
              ))}
              <span className="rating-text">
                {formData.rating > 0 ? (
                  ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][formData.rating]
                ) : (
                  hoveredRating > 0 ? 
                  ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoveredRating] : 
                  'Select a rating'
                )}
              </span>
            </div>
            {errors.rating && <div className="error-text">{errors.rating}</div>}
          </div>
          
          <div className="form-section">
            <h3>Tell us more</h3>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              placeholder="Please provide your feedback here..."
              rows="5"
              className={errors.comments ? 'error' : ''}
            ></textarea>
            {errors.comments && <div className="error-text">{errors.comments}</div>}
          </div>
          
          <div className="form-section">
            <h3>Contact information (optional)</h3>
            <div className="contact-fields">
              <div className="email-field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email address"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <div className="error-text">{errors.email}</div>}
              </div>
              
              <div className="contact-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="allowContact"
                    checked={formData.allowContact}
                    onChange={handleChange}
                  />
                  <span>I'd like to be contacted about this feedback</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="secondary-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="primary-button"
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
          </div>
        </form>
      )}
      
      <style jsx>{`
        .enhanced-feedback-form {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .feedback-form {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 30px;
        }
        
        .form-section {
          margin-bottom: 24px;
        }
        
        .form-section h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: #2d3748;
        }
        
        .feedback-type-options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .feedback-type-option {
          flex: 1;
          min-width: 120px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .feedback-type-option:hover {
          border-color: #3498db;
          background-color: #f8fafc;
        }
        
        .feedback-type-option.selected {
          border-color: #3498db;
          background-color: #ebf8ff;
          color: #2b6cb0;
          font-weight: 500;
        }
        
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        
        .categories-options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .category-option {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .category-option:hover {
          background-color: #f8fafc;
        }
        
        .category-option input {
          margin-right: 8px;
        }
        
        .rating-container {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        
        .rating-btn {
          background: none;
          border: none;
          padding: 5px;
          cursor: pointer;
          font-size: 1.8rem;
          color: #cbd5e0;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .rating-btn:hover {
          transform: scale(1.1);
        }
        
        .rating-btn.hovered,
        .rating-btn.active {
          color: #f6ad55;
        }
        
        .rating-text {
          margin-left: 10px;
          font-size: 0.9rem;
          color: #718096;
        }
        
        textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          resize: vertical;
          min-height: 120px;
          transition: all 0.2s;
        }
        
        textarea:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
        }
        
        .contact-fields {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .email-field {
          width: 100%;
        }
        
        .email-field label {
          display: block;
          margin-bottom: 5px;
          font-size: 0.9rem;
          color: #4a5568;
        }
        
        input[type="email"] {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
        }
        
        input[type="email"]:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .checkbox-label input {
          margin-right: 10px;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 30px;
        }
        
        .primary-button,
        .secondary-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .primary-button {
          background-color: #3498db;
          color: white;
          border: none;
        }
        
        .primary-button:hover {
          background-color: #2980b9;
        }
        
        .secondary-button {
          background-color: white;
          color: #4a5568;
          border: 1px solid #e2e8f0;
        }
        
        .secondary-button:hover {
          background-color: #f8fafc;
        }
        
        .primary-button:disabled {
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
        
        .success-message,
        .error-message {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        
        .success-message {
          border-top: 4px solid #48bb78;
        }
        
        .error-message {
          border-top: 4px solid #f56565;
        }
        
        .success-message svg {
          color: #48bb78;
        }
        
        .error-message svg {
          color: #f56565;
        }
        
        .success-message h2,
        .error-message h2 {
          margin: 0;
          font-size: 1.5rem;
        }
        
        .success-message p,
        .error-message p {
          margin: 0 0 20px 0;
          color: #718096;
        }
        
        .error-text {
          color: #e53e3e;
          font-size: 0.85rem;
          margin-top: 5px;
        }
        
        .error {
          border-color: #e53e3e !important;
        }
        
        @media (max-width: 768px) {
          .feedback-type-options {
            flex-direction: column;
          }
          
          .feedback-type-option {
            width: 100%;
          }
          
          .form-actions {
            flex-direction: column-reverse;
          }
          
          .primary-button,
          .secondary-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedFeedbackForm;
