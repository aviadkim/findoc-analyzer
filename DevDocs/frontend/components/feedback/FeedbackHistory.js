/**
 * Feedback History Component
 *
 * Displays a user's feedback history with filtering and sorting options.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  Badge,
  Stack,
  Flex,
  Spacer,
  Select,
  Divider,
  Alert,
  AlertIcon,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { FaSort, FaFilter, FaExternalLinkAlt } from 'react-icons/fa';

// Helper to format dates
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Status badge component
const StatusBadge = ({ status }) => {
  const colorScheme = {
    pending: 'yellow',
    in_progress: 'blue',
    resolved: 'green',
    rejected: 'red'
  }[status] || 'gray';

  const label = {
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected'
  }[status] || status;

  return (
    <Badge colorScheme={colorScheme} borderRadius="full" px={2} py={0.5}>
      {label}
    </Badge>
  );
};

// Feedback item detail modal
const FeedbackDetailModal = ({ isOpen, onClose, feedback }) => {
  if (!feedback) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {feedback.subject}
          <Text fontSize="sm" color="gray.500" mt={1}>
            Submitted on {formatDate(feedback.created_at)}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Flex mb={3}>
            <StatusBadge status={feedback.status} />
            <Spacer />
            <Text fontSize="sm" color="gray.600">
              Rating: {feedback.rating}/5
            </Text>
          </Flex>
          
          <Divider mb={3} />
          
          <Text whiteSpace="pre-wrap">{feedback.content}</Text>
          
          {feedback.admin_notes && (
            <Box mt={4} p={3} bg="gray.50" borderRadius="md">
              <Text fontWeight="bold" fontSize="sm" mb={1}>
                Admin Notes:
              </Text>
              <Text fontSize="sm">{feedback.admin_notes}</Text>
            </Box>
          )}
          
          {feedback.feedback_responses && feedback.feedback_responses.length > 0 && (
            <Box mt={4}>
              <Heading size="sm" mb={2}>
                Responses
              </Heading>
              <Stack spacing={3}>
                {feedback.feedback_responses.map((response) => (
                  <Box 
                    key={response.id} 
                    p={3} 
                    borderWidth="1px" 
                    borderRadius="md" 
                    bg={response.is_admin_response ? "blue.50" : "white"}
                  >
                    <Flex>
                      <Text fontSize="sm" fontWeight="bold">
                        {response.is_admin_response ? "Support Team" : "You"}
                      </Text>
                      <Spacer />
                      <Text fontSize="xs" color="gray.500">
                        {formatDate(response.created_at)}
                      </Text>
                    </Flex>
                    <Text mt={2} fontSize="sm">{response.content}</Text>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const FeedbackHistory = () => {
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch feedback history
  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);
        if (typeFilter) params.append('type', typeFilter);
        
        const response = await fetch(`/api/feedback?${params.toString()}`);
        const result = await response.json();

        if (response.ok) {
          setFeedback(result.data.feedback);
        } else {
          setError(result.message || 'Error fetching feedback');
          console.error('Error fetching feedback:', result);
        }
      } catch (err) {
        setError('Could not fetch feedback history. Please try again.');
        console.error('Feedback fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [statusFilter, typeFilter]);

  // Handle opening feedback detail modal
  const handleViewDetail = (item) => {
    setSelectedFeedback(item);
    onOpen();
  };

  // Sort feedback based on current sort order
  const sortedFeedback = [...feedback].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else {
      return new Date(a.created_at) - new Date(b.created_at);
    }
  });

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  };

  if (isLoading) {
    return (
      <Box textAlign="center" p={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading feedback history...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Flex mb={4} align="center">
        <Heading size="md">Your Feedback History</Heading>
        <Spacer />
        
        <Box>
          <Tooltip label={`Sort by ${sortOrder === 'newest' ? 'oldest' : 'newest'} first`}>
            <IconButton
              icon={<FaSort />}
              onClick={toggleSortOrder}
              aria-label={`Sort by ${sortOrder === 'newest' ? 'oldest' : 'newest'}`}
              size="sm"
              mr={2}
            />
          </Tooltip>
          
          <Select
            size="sm"
            width="150px"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Filter by status"
            variant="outline"
            ml={2}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </Select>
        </Box>
      </Flex>

      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!error && feedback.length === 0 && (
        <Box p={6} textAlign="center" borderWidth="1px" borderRadius="md">
          <Text>You haven't submitted any feedback yet.</Text>
        </Box>
      )}

      <Stack spacing={4}>
        {sortedFeedback.map((item) => (
          <Card key={item.id} variant="outline">
            <CardHeader pb={2}>
              <Flex align="center">
                <Heading size="sm">{item.subject}</Heading>
                <Spacer />
                <StatusBadge status={item.status} />
              </Flex>
            </CardHeader>
            
            <CardBody py={2}>
              <Text noOfLines={2}>{item.content}</Text>
            </CardBody>
            
            <CardFooter pt={2} justifyContent="space-between" alignItems="center">
              <Text fontSize="sm" color="gray.500">
                {formatDate(item.created_at)}
              </Text>
              
              <Button 
                rightIcon={<FaExternalLinkAlt />} 
                size="sm" 
                variant="ghost" 
                onClick={() => handleViewDetail(item)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </Stack>

      <FeedbackDetailModal 
        isOpen={isOpen} 
        onClose={onClose} 
        feedback={selectedFeedback} 
      />
    </Box>
  );
};

export default FeedbackHistory;