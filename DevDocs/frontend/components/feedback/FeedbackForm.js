/**
 * Feedback Form Component
 *
 * A reusable form component for collecting user feedback.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Stack,
  Heading,
  Text,
  useToast,
  RadioGroup,
  Radio,
  HStack,
  Flex,
  Spacer,
  Alert,
  AlertIcon,
  AlertTitle,
  CloseButton
} from '@chakra-ui/react';

const FeedbackForm = ({ onSubmitSuccess, minimizable = false, defaultType = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    type: defaultType || 'feature_request',
    subject: '',
    content: '',
    rating: 5
  });
  const [error, setError] = useState('');
  const toast = useToast();

  // Fetch feedback categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/feedback/categories');
        const data = await response.json();
        
        if (data.status === 'success') {
          setCategories(data.data.categories);
        }
      } catch (err) {
        console.error('Error fetching feedback categories:', err);
        // Use default categories if API fails
        setCategories([
          { id: 'feature_request', name: 'Feature Request', description: 'Suggest a new feature' },
          { id: 'bug_report', name: 'Bug Report', description: 'Report an issue or error' },
          { id: 'usability', name: 'Usability', description: 'Feedback about the user experience' },
          { id: 'general', name: 'General Feedback', description: 'Any other feedback' }
        ]);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      rating: parseInt(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate form
    if (!formData.subject.trim()) {
      setError('Please enter a subject');
      setIsLoading(false);
      return;
    }

    if (!formData.content.trim()) {
      setError('Please enter your feedback');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Feedback submitted',
          description: 'Thank you for your feedback!',
          status: 'success',
          duration: 5000,
          isClosable: true
        });

        // Reset form
        setFormData({
          type: defaultType || 'feature_request',
          subject: '',
          content: '',
          rating: 5
        });

        // Call success callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess(result.data.feedback);
        }

        // Minimize form if minimizable
        if (minimizable) {
          setIsMinimized(true);
        }
      } else {
        setError(result.message || 'Error submitting feedback');
        console.error('Feedback submission error:', result);
      }
    } catch (err) {
      setError('Error submitting feedback. Please try again.');
      console.error('Feedback submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isMinimized) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="md" bg="white" shadow="sm">
        <Flex align="center">
          <Text>Thanks for your feedback!</Text>
          <Spacer />
          <Button size="sm" onClick={() => setIsMinimized(false)}>
            Submit Another
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box p={6} borderWidth="1px" borderRadius="md" bg="white" shadow="md">
      <Heading size="md" mb={4}>
        Share Your Feedback
      </Heading>
      
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <AlertTitle>{error}</AlertTitle>
          <Spacer />
          <CloseButton onClick={() => setError('')} />
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Feedback Type</FormLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Subject</FormLabel>
            <Input
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Brief summary of your feedback"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Your Feedback</FormLabel>
            <Textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Please describe your feedback in detail"
              rows={5}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Rate Your Experience</FormLabel>
            <RadioGroup value={formData.rating.toString()} onChange={handleRatingChange}>
              <HStack spacing={4}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <Radio key={num} value={num.toString()}>
                    {num}
                  </Radio>
                ))}
              </HStack>
            </RadioGroup>
            <Flex mt={1}>
              <Text fontSize="sm" color="gray.500">
                Poor
              </Text>
              <Spacer />
              <Text fontSize="sm" color="gray.500">
                Excellent
              </Text>
            </Flex>
          </FormControl>

          <Button
            mt={4}
            colorScheme="blue"
            isLoading={isLoading}
            type="submit"
            width="full"
          >
            Submit Feedback
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default FeedbackForm;