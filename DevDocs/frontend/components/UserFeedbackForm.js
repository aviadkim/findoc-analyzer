import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

/**
 * UserFeedbackForm Component
 * 
 * A form component for collecting user feedback about the FinDoc Analyzer application.
 * Users can rate their experience, select feedback categories, and provide detailed comments.
 * 
 * @component
 */
const UserFeedbackForm = ({ onSubmitSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      rating: 3,
      feedbackType: 'general',
      feedbackCategories: [],
      comments: '',
      email: '',
      allowContact: false
    }
  });

  const watchFeedbackType = watch('feedbackType');
  const watchAllowContact = watch('allowContact');

  // Feedback categories based on feedback type
  const feedbackCategories = {
    general: [
      { value: 'ui', label: 'User Interface' },
      { value: 'performance', label: 'Performance' },
      { value: 'features', label: 'Features' },
      { value: 'usability', label: 'Usability' },
      { value: 'other', label: 'Other' }
    ],
    bug: [
      { value: 'crash', label: 'Application Crash' },
      { value: 'data_loss', label: 'Data Loss' },
      { value: 'incorrect_results', label: 'Incorrect Results' },
      { value: 'ui_issues', label: 'UI Issues' },
      { value: 'performance_issues', label: 'Performance Issues' },
      { value: 'other', label: 'Other' }
    ],
    feature: [
      { value: 'document_processing', label: 'Document Processing' },
      { value: 'financial_analysis', label: 'Financial Analysis' },
      { value: 'data_visualization', label: 'Data Visualization' },
      { value: 'export_options', label: 'Export Options' },
      { value: 'integration', label: 'Integration with Other Systems' },
      { value: 'other', label: 'Other' }
    ]
  };

  /**
   * Handle form submission
   * @param {Object} data - Form data
   */
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Add timestamp and user info to the feedback data
      const feedbackData = {
        ...data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        // In a real app, you would include user ID if authenticated
        userId: 'anonymous' // Replace with actual user ID when available
      };
      
      // Send feedback to the API
      const response = await axios.post('/api/feedback', feedbackData);
      
      setSubmitSuccess(true);
      reset(); // Reset form
      
      // Call the success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitError(
        error.response?.data?.message || 
        'An error occurred while submitting your feedback. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle form cancellation
   */
  const handleCancel = () => {
    reset();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">We Value Your Feedback</h2>
      
      {submitSuccess ? (
        <div className="bg-green-50 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Thank you for your feedback! Your input helps us improve FinDoc Analyzer.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setSubmitSuccess(false)}
            >
              Submit Another Feedback
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback Type
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  value="general"
                  {...register('feedbackType', { required: true })}
                />
                <span className="ml-2 text-gray-700">General Feedback</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  value="bug"
                  {...register('feedbackType', { required: true })}
                />
                <span className="ml-2 text-gray-700">Report a Bug</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  value="feature"
                  {...register('feedbackType', { required: true })}
                />
                <span className="ml-2 text-gray-700">Feature Request</span>
              </label>
            </div>
            {errors.feedbackType && (
              <p className="mt-1 text-sm text-red-600">Please select a feedback type</p>
            )}
          </div>

          {/* Rating (only for general feedback) */}
          {watchFeedbackType === 'general' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How would you rate your experience with FinDoc Analyzer?
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Poor</span>
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className="inline-flex flex-col items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-blue-600"
                      value={value}
                      {...register('rating', { required: watchFeedbackType === 'general' })}
                    />
                    <span className="text-xs text-gray-500 mt-1">{value}</span>
                  </label>
                ))}
                <span className="text-sm text-gray-500">Excellent</span>
              </div>
              {errors.rating && (
                <p className="mt-1 text-sm text-red-600">Please provide a rating</p>
              )}
            </div>
          )}

          {/* Feedback Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {watchFeedbackType === 'bug' ? 'Issue Category' : 
               watchFeedbackType === 'feature' ? 'Feature Category' : 
               'Feedback Category'}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {feedbackCategories[watchFeedbackType]?.map((category) => (
                <label key={category.value} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                    value={category.value}
                    {...register('feedbackCategories')}
                  />
                  <span className="ml-2 text-gray-700">{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
              {watchFeedbackType === 'bug' ? 'Please describe the issue in detail' : 
               watchFeedbackType === 'feature' ? 'Please describe the feature you would like to see' : 
               'Comments'}
            </label>
            <textarea
              id="comments"
              rows={4}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder={
                watchFeedbackType === 'bug' ? 'What happened? What were you trying to do? How can we reproduce the issue?' : 
                watchFeedbackType === 'feature' ? 'What feature would you like to see? How would it help you?' : 
                'Tell us what you think about FinDoc Analyzer...'
              }
              {...register('comments', { 
                required: 'Please provide your feedback',
                minLength: { value: 10, message: 'Please provide more details' }
              })}
            ></textarea>
            {errors.comments && (
              <p className="mt-1 text-sm text-red-600">{errors.comments.message}</p>
            )}
          </div>

          {/* Contact Information */}
          <div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="allowContact"
                  type="checkbox"
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  {...register('allowContact')}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="allowContact" className="font-medium text-gray-700">
                  Allow us to contact you about this feedback
                </label>
                <p className="text-gray-500">
                  We may need additional information to address your feedback
                </p>
              </div>
            </div>
          </div>

          {/* Email (only if allowContact is checked) */}
          {watchAllowContact && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="your.email@example.com"
                {...register('email', {
                  required: watchAllowContact ? 'Please provide your email address' : false,
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserFeedbackForm;
