import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  TextField, 
  Paper, 
  Rating, 
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Feedback as FeedbackIcon,
  ThumbUp,
  ThumbDown,
  Send
} from '@mui/icons-material';

/**
 * Feedback Component for collecting user feedback on FinDocRAG.
 */
const FeedbackComponent = ({ 
  sessionId, 
  documentId = null, 
  query = null, 
  answer = null, 
  apiBaseUrl = '' 
}) => {
  // State
  const [feedbackType, setFeedbackType] = useState('general');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Handle feedback type change
  const handleFeedbackTypeChange = (event) => {
    setFeedbackType(event.target.value);
  };
  
  // Handle rating change
  const handleRatingChange = (event, newValue) => {
    setRating(newValue);
  };
  
  // Handle comment change
  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };
  
  // Handle dialog open
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  
  // Handle feedback submission
  const handleSubmitFeedback = async () => {
    // Validate input
    if (rating === 0) {
      setSubmitError('Please provide a rating');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Create feedback data
      const feedbackData = {
        sessionId,
        feedbackType,
        rating,
        comment
      };
      
      // Add optional fields if available
      if (documentId) feedbackData.documentId = documentId;
      if (query) feedbackData.query = query;
      if (answer) feedbackData.answer = answer;
      
      // Submit feedback
      const response = await fetch(`${apiBaseUrl}/api/rag/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      });
      
      if (!response.ok) {
        throw new Error(`Feedback submission failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Show success message
      setSubmitSuccess(true);
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Close dialog
      handleCloseDialog();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSubmitSuccess(false);
    setSubmitError(null);
  };
  
  // Render feedback button
  const renderFeedbackButton = () => {
    return (
      <Button
        variant="outlined"
        startIcon={<FeedbackIcon />}
        onClick={handleOpenDialog}
        size="small"
      >
        Provide Feedback
      </Button>
    );
  };
  
  // Render feedback dialog
  const renderFeedbackDialog = () => {
    return (
      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <FeedbackIcon sx={{ mr: 1 }} />
            Provide Feedback
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your feedback helps us improve the FinDocRAG system. Please rate your experience and provide any comments.
          </DialogContentText>
          
          <Box sx={{ mt: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Feedback Type</FormLabel>
              <RadioGroup
                row
                value={feedbackType}
                onChange={handleFeedbackTypeChange}
              >
                <FormControlLabel value="general" control={<Radio />} label="General" />
                <FormControlLabel value="document" control={<Radio />} label="Document Processing" />
                <FormControlLabel value="query" control={<Radio />} label="Query Response" />
                <FormControlLabel value="ui" control={<Radio />} label="User Interface" />
              </RadioGroup>
            </FormControl>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <FormLabel component="legend">Rating</FormLabel>
            <Rating
              name="feedback-rating"
              value={rating}
              onChange={handleRatingChange}
              size="large"
              sx={{ mt: 1 }}
            />
          </Box>
          
          <TextField
            fullWidth
            label="Comments"
            multiline
            rows={4}
            value={comment}
            onChange={handleCommentChange}
            margin="normal"
            variant="outlined"
            placeholder="Please provide any additional comments or suggestions..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitFeedback} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting || rating === 0}
            startIcon={isSubmitting ? null : <Send />}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Render quick feedback buttons
  const renderQuickFeedback = () => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">Was this helpful?</Typography>
        <Button
          size="small"
          startIcon={<ThumbUp />}
          onClick={() => {
            setRating(5);
            setFeedbackType('query');
            setComment('This was helpful');
            handleSubmitFeedback();
          }}
        >
          Yes
        </Button>
        <Button
          size="small"
          startIcon={<ThumbDown />}
          onClick={() => {
            setRating(2);
            setFeedbackType('query');
            setComment('This was not helpful');
            handleSubmitFeedback();
          }}
        >
          No
        </Button>
      </Box>
    );
  };
  
  return (
    <>
      {/* Feedback Button */}
      {renderFeedbackButton()}
      
      {/* Quick Feedback (for query responses) */}
      {query && answer && renderQuickFeedback()}
      
      {/* Feedback Dialog */}
      {renderFeedbackDialog()}
      
      {/* Success Snackbar */}
      <Snackbar
        open={submitSuccess}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Thank you for your feedback!
        </Alert>
      </Snackbar>
      
      {/* Error Snackbar */}
      <Snackbar
        open={!!submitError}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="error">
          {submitError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FeedbackComponent;
